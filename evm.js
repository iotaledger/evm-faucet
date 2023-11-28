'use strict';
const { ethers } = require("ethers");

const faucets = require('./contracts/faucets.json');
const contractAbi = require('./contracts/abi/faucet.json');
const tokens = require('./contracts/tokens.json');

async function requestFunds(token, address) {
    // console.log('token, address:', token, address);
    const provider = new ethers.providers.JsonRpcProvider(process.env.SHIMMEREVM_JSONRPC);
    let contractAddress = faucets[token.toString()].address;
    console.log('contractAddress:', contractAddress);
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
        address: tokens[token.toString()].address,
        symbol: token,
        decimals: tokens[token.toString()].decimals,
        image: 'https://files.iota.org/media/smr_evm_circular_crop.png'
    };
}

module.exports = {
    requestFunds,
    getTokenData
};
