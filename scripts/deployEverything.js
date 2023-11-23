const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const zeroAddress = ethers.constants.AddressZero;

const forceRedeploy = process.env.FORCE_REDEPLOY === 'true';
const faucetAdminAddress = process.env.FAUCET_ADMIN || zeroAddress;


async function main() {
    // force a new deployment on the network if desired
    if (forceRedeploy) {
        await hre.run('clean');
        await hre.run('compile');
    }

    if (faucetAdminAddress !== zeroAddress) {
        console.log("specifying "+faucetAdminAddress+" as faucet admin")
    }

    // load tokens from tokens.json file and update it when deployment is complete
    const tokensFilePath = path.join(__dirname, "../contracts/tokens.json");
    const faucetsFilePath = path.join(__dirname, "../contracts/faucets.json");

    const tokensRawData = fs.readFileSync(tokensFilePath);
    const tokens = JSON.parse(tokensRawData);

    const TokenFaucetFactory = await hre.ethers.getContractFactory("TokenFaucetFactory");
    const owner = (await hre.ethers.getSigners())[0];
    const factoryContract = await TokenFaucetFactory.deploy();
    await factoryContract.deployed();

    console.log(`Factory Contract deployed to: ${factoryContract.address}`);

    // Verification request for the factory contract
    const verificationRequests = [
        {
            contract: 'TokenFaucetFactory',
            address: factoryContract.address,
            constructorArguments: [],
        }
    ];

    const updatedTokens = {};
    const faucets = {};

    for (const [name, tokenData] of Object.entries(tokens)) {
        console.log(`Deploying token and faucet for ${name}...`);
        const { address: initialTokenAddress, decimals } = tokenData;

        const txnResponse = await factoryContract.createTokenAndFaucet(
            "Testnet "+ name,
            name,
            decimals,
            faucetAdminAddress
        );
        const receipt = await txnResponse.wait();

        const blockNumber = receipt.blockNumber;

        const events = await factoryContract.queryFilter(factoryContract.filters.TokenFaucetCreated(), blockNumber, blockNumber);
        const event = events[0];
        const [tokenAddress, faucetAddress] = event.args;

        updatedTokens[name] = { address: tokenAddress, decimals: decimals };
        faucets[name] = { address: faucetAddress };

        console.log(`Token Contract for ${name}: ${tokenAddress}`);
        console.log(`Faucet Contract for ${name}: ${faucetAddress}\n`);

        // Store verification data
        verificationRequests.push({
            contract: 'Token',
            address: tokenAddress,
            constructorArguments: ["Testnet "+name, name, decimals, factoryContract.address]
        });

        verificationRequests.push({
            contract: 'Faucet',
            address: faucetAddress,
            constructorArguments: [tokenAddress,faucetAdminAddress]
        });
    }

    // if we are on any other network besides the internal hardhat test network, verify the contracts
    if (hre.network.name !== 'hardhat') {
        console.log("waiting six blocks before attempting verification");
        // Start the process of sending transactions to mine blocks if SEND_BLOCK_TXNS is true
        if (process.env.SEND_BLOCK_TXNS === 'true') {
            const wallet = (await ethers.getSigners())[0];
            sendDummyTransactions(6, wallet).catch((error) => {
                console.error('Error sending dummy transactions:', error);
            });
        }
        await waitForSixBlocks();

        for (const request of verificationRequests) {
            console.log(`Verifying ${request.contract} at ${request.address}`);
            try {
                await hre.run("verify:verify", {
                    address: request.address,
                    constructorArguments: request.constructorArguments,
                });
            } catch (error) {
                console.error(`Failed to verify ${request.contract} at ${request.address}:`, error);
            }
        }
    } else {
        console.log("skipping verification on hardhat network");
    }

    // write updated tokens.json and faucets.json
    fs.writeFileSync(tokensFilePath, JSON.stringify(updatedTokens, null, 4));
    fs.writeFileSync(faucetsFilePath, JSON.stringify(faucets, null, 4));

    console.log('Updated tokens.json and faucets.json');

    console.log('Done deploying tokens and faucets.');
}

async function waitForSixBlocks() {
    let currentBlockNumber = await ethers.provider.getBlockNumber();
    const targetBlockNumber = currentBlockNumber + 6;

    console.log(`Current block number: ${currentBlockNumber}`);
    console.log(`Waiting until block number ${targetBlockNumber}`);

    let latestBlockNumber = currentBlockNumber;
    let prevTimestamp = Date.now(); // Record the current timestamp

    while (latestBlockNumber < targetBlockNumber) {
        latestBlockNumber = await ethers.provider.getBlockNumber();
        if (latestBlockNumber > currentBlockNumber) {
            const block = await ethers.provider.getBlock(latestBlockNumber);
            const currentTimestamp = Date.now(); // Get the current timestamp
            const duration = currentTimestamp - prevTimestamp; // Calculate the duration
            prevTimestamp = currentTimestamp; // Update the previous timestamp

            const timestamp = new Date(block.timestamp * 1000);
            console.log(
                `Reached block number ${latestBlockNumber} at ${timestamp.toUTCString()} ` +
                `(took ${duration}ms since last block)`
            );
            currentBlockNumber = latestBlockNumber; // Update the current block number
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Check every second
    }
    console.log('Done waiting for 6 blocks.');
}

async function sendDummyTransactions(numberOfTransactions, wallet) {
    for (let i = 0; i < numberOfTransactions; i++) {
        // Send dummy transaction (could be self-transfer or 0-value transfer)
        const tx = await wallet.sendTransaction({
            to: wallet.address,
            value: ethers.utils.parseUnits("0", "ether")
        });

        // Log transaction hash, don't wait for transaction to be mined
        console.log(`Transaction ${i + 1} sent with hash: ${tx.hash}`);
       // await new Promise(resolve => setTimeout(resolve, 20000)); // sleep 20 seconds

    }
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
