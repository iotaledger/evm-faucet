'use strict';
const { ethers } = require("ethers");

const faucets = {
    'weth': process.env.WETH_FAUCET_ADDRESS,
    'wbtc': process.env.WBTC_FAUCET_ADDRESS
}
let contractAbi = require('./contracts/abi/faucet.json');

async function requestFunds(token, address) {
    // console.log('token, address:', token, address);
    const provider = new ethers.providers.JsonRpcProvider(process.env.SHIMMEREVM_JSONRPC);
    let contractAddress = faucets[token.toString().toLowerCase()];
    // console.log('contractAddress:', contractAddress);
    // console.log('contractAbi:', contractAbi);
    const faucetContract = new ethers.Contract(contractAddress, contractAbi);
    let wallet = await new ethers.Wallet(process.env.PRIVATE_KEY);
    let walletSigner = await wallet.connect(provider);
    const faucetSigner = faucetContract.connect(walletSigner);

    let tx = await faucetSigner.requestFunds(address);
    console.log('tx:', tx);

    let txReceipt = await tx.wait();
    console.log('txReceipt:', txReceipt);

    return true;
}

async function getTokenData(token) {
    return {
        address: faucets[token.toString().toLowerCase()],
        symbol: token,
        decimals: 18,
        image: 'https://shimmer.network/assets/logo.svg'
    };
}

module.exports = {
    requestFunds,
    getTokenData
};
