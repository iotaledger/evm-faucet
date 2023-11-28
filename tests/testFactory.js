const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenFaucetFactory", function () {
    let TokenFaucetFactory, factory, SimpleERC20Token, Faucet, admin, user, anotherAccount;

    beforeEach(async function () {
        // Contracts are deployed before each test
        TokenFaucetFactory = await ethers.getContractFactory("TokenFaucetFactory");
        SimpleERC20Token = await ethers.getContractFactory("SimpleERC20Token");
        Faucet = await ethers.getContractFactory("Faucet");

        // Deploy Factory
        factory = await TokenFaucetFactory.deploy();
        await factory.deployed();

        // Get signers
        [admin, user, anotherAccount] = await ethers.getSigners();
    });

    describe("Factory Role Management", function () {
        it("should grant DEFAULT_ADMIN_ROLE to deployer", async function () {
            const hasRole = await factory.hasRole(await factory.DEFAULT_ADMIN_ROLE(), admin.address);
            expect(hasRole).to.be.true;
        });
    });

    describe("createTokenAndFaucet", function () {
        it("should deploy a new token and faucet", async function () {
            const tx = await factory.connect(admin).createTokenAndFaucet("TestToken", "TT", 18, admin.address);
            const receipt = await tx.wait();

            // Event should be emitted with new contracts' addresses
            const event = receipt.events.find(event => event.event === 'TokenFaucetCreated');
            expect(event).to.exist;
            expect(event.args.tokenAddress).to.properAddress;
            expect(event.args.faucetAddress).to.properAddress;

            // Check if token and faucet are deployed
            const tokenAddress = event.args.tokenAddress;
            const faucetAddress = event.args.faucetAddress;

            const token = SimpleERC20Token.attach(tokenAddress);
            const faucet = Faucet.attach(faucetAddress);

            expect(await token.name()).to.equal("TestToken");
            expect(await token.symbol()).to.equal("TT");

            expect(await faucet.token()).to.equal(tokenAddress);
        });

        it("should fail to deploy as a non-admin", async function () {
            await expect(factory.connect(user).createTokenAndFaucet("TestToken", "TT", 18, user.address)).to.be.reverted;
        });
    });

    describe("Faucet functionality", function () {
        let token, faucet, tokenAddress, faucetAddress;

        beforeEach(async function () {
            // Create a token and faucet pair
            const tx = await factory.connect(admin).createTokenAndFaucet("TestToken", "TT", 18, admin.address);
            const receipt = await tx.wait();

            // Search for TokenFaucetCreated event and extract token and faucet addresses
            const event = receipt.events.find(e => e.event === 'TokenFaucetCreated');
            if (!event) {
                throw new Error('TokenFaucetCreated event not found');
            }

            tokenAddress = event.args.tokenAddress;
            faucetAddress = event.args.faucetAddress;

            token = SimpleERC20Token.attach(tokenAddress);
            faucet = Faucet.attach(faucetAddress);
        });

        it("should distribute tokens via faucet as an admin", async function () {
            // Admin distributes tokens to `anotherAccount`
            await faucet.connect(admin).requestFunds(user.address);
            expect(await token.balanceOf(user.address)).to.equal(await faucet.faucetDripAmount());
        });

        it("should not distribute tokens to an ineligible address", async function () {
            // Check the balance exceeds maximum allowed
            await faucet.connect(admin).setMaxAmountToOwn(100);
            await faucet.connect(admin).setFaucetDripAmount(101);
            await faucet.connect(admin).requestFunds(user.address);
            await expect(faucet.connect(admin).requestFunds(user.address)).to.be.revertedWith('FaucetError: Receiver\'s token balance exceeds maximum allowed');
        });

        it("should not distribute tokens if funds are insufficient in faucet", async function () {
            // Transferring all tokens away from faucet to simulate empty faucet
            const balance = await token.balanceOf(faucetAddress);
            const decimals = await token.decimals();
            let balanceWithDecimals = ethers.utils.formatUnits(balance, decimals);
            let balanceBigNumberWithDecimals = ethers.utils.parseUnits(balanceWithDecimals, 0);
            await faucet.connect(admin).setFaucetDripAmount(balanceBigNumberWithDecimals);
            await faucet.connect(admin).requestFunds(user.address);

            // Admin attempts to distribute tokens to `anotherAccount`
            await expect(faucet.connect(admin).requestFunds(anotherAccount.address)).to.be.revertedWith('FaucetError: Insufficient funds in faucet');
        });
    });
});
