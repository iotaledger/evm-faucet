'use strict';

const shimmerevm = {
    chainName: 'ShimmerEVM Testnet',
    chainId: 1071,
    rpcUrl: 'https://json-rpc.evm.testnet.shimmer.network',
    blockExplorerUrl: 'https://explorer.evm.testnet.shimmer.network/',
    currency: 'SMR',
    decimal: 18
}

$('#btn-faucet').click(async function (e) {
    e.preventDefault();
    let address = $('#address').val();
    let token = $( "#token option:selected" ).text().toString();
    let addressValidated = await validateAddress(address);
    if (addressValidated === true) {
        $('#faucet-msg').html(alertContent.loading);
        await requestFunds(token, address);
    } else {
        // console.log('Invalid Address!');
        $('#faucet-msg').html(alertContent.errorInvalid);
    }
});

$('#btn-token').click(async function(e) {
    e.preventDefault();
    let token = $( "#token option:selected" ).text().toString();
    // console.log('token:', token);
    // Get Token Data
    let apiResponse = await axios.get('/token', {
        params: {
            key: token
        }
    });
    // console.log('apiResponse:', apiResponse);

    try {
        const wasAdded = await ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: apiResponse.data.address,
                    symbol: apiResponse.data.symbol,
                    decimals: apiResponse.data.decimals,
                    image: apiResponse.data.image,
                },
            },
        });

        if (wasAdded) {
            console.log('Thanks for your interest!');
        } else {
            console.log('Your loss!');
        }
    } catch (error) {
        console.log(error);
    }
});

$('#add-to-metamask').click(async function(e) {
    e.preventDefault();
    console.log('Adding Shimmer to Metamask...');
    let hexParsedChainId = parseChainId(shimmerevm.chainId);

    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainName: shimmerevm.chainName,
                    chainId: hexParsedChainId,
                    nativeCurrency: {
                        name: shimmerevm.currency,
                        decimals: shimmerevm.decimal,
                        symbol: shimmerevm.currency
                    },
                    rpcUrls: [shimmerevm.rpcUrl],
                    blockExplorerUrls: [shimmerevm.blockExplorerUrl]
                }
            ]
        });
    } catch (error) {
        console.log(error);
    }
});

// Validate evm address
async function validateAddress(address) {
    try {
        let addressResponse = ethers.utils.getAddress(address);
        console.log('addressResponse:', addressResponse);
    } catch (error) {
        console.log('error:', error);
        return false;
    }
    return true;
}

async function requestFunds(token, address) {
    console.log('\nRequesting', token, 'for', address);
    let apiResponse = await axios.post('/fund', {
        token: token,
        address: address
    });
    // console.log('apiResponse:', apiResponse);
    $('#faucet-msg').html(alertContent.success);
}

function parseChainId(chainId) {
    let hexChainId = ethers.utils.hexlify(chainId);
    // Trim any leading 0s
    return '0x' + hexChainId.split('0x')[1].replace(/^0+/, '');
}
