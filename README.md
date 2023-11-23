# EVM Faucet App

> The tokens that are dropped by the faucet are not actual wrapped tokens but instead they are simulated wrapped tokens that just exist on our network. This means that these tokens do not have any real-world value and are only meant for testing or educational purposes, and they don't exist on the selected Testnet.

### Uses:
- NodeJs
- Express
- EJS
- [Tailwindcss](https://tailwindcss.com/docs/installation)
- Ethersjs

![Demo](./statics/img/demo.png)

### Setup

1. `cp .env.example .env` and replace the variables with your custom ones.
2. `npm install --save-dev`

### Deploy Contracts
1. Run `npx hardhat run --network ShimmerEVMTestnet .\scripts\deployEverything.js` to deploy all tokens in `contracts\tokens.json`, create faucets for them, and update both the `tokens.json` and `faucets.json` files with new addresses.

Note: If you want to allow another address to request funds from the faucet besides the deployer, set the env var `FAUCET_ADMIN` with this address before running the script.
Since the testnet can be slow to update, if you set `SEND_BLOCK_TXNS` to `true` then your wallet will send six zero value transfer transactions to help move the network along while we wait to verify the contracts.
### Run
`npm start` or `nodemon`

Open the webapp on your browser.
