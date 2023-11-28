require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require('@nomiclabs/hardhat-waffle');

const {
  SHIMMEREVM_JSONRPC,
  SHIMMEREVM_CHAINID,
  PRIVATE_KEY
} = process.env

module.exports = {
  solidity: "0.8.20",
  networks: {
    ShimmerEVMTestnet: {
      url: SHIMMEREVM_JSONRPC || "https://json-rpc.evm.testnet.shimmer.network",
      chainId: SHIMMEREVM_CHAINID ? parseInt(SHIMMEREVM_CHAINID) : 1073,
      accounts: [ PRIVATE_KEY ]
    }
  },
  etherscan: {
    apiKey:
        {
          ShimmerEVMTestnet: "no-api-key-required"
        },
    customChains: [
      {
        apikey: "no-api-key-required",
        network: "ShimmerEVMTestnet",
        chainId: SHIMMEREVM_CHAINID ? parseInt(SHIMMEREVM_CHAINID) : 1073,
        urls: {
          apiURL: "https://explorer.evm.testnet.shimmer.network/api",
          browserURL: "https://explorer.evm.testnet.shimmer.network/"
        }
      }
    ]
  }
};
