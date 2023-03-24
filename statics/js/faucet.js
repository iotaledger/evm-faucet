'use strict';

$('#btn-faucet').click(async function (e) {
    e.preventDefault();
    let address = $('#address').val();
    let token = $( "#token option:selected" ).text().toString().toLowerCase();
    let addressValidated = await validateAddress(address);
    if (addressValidated === true) {
        $('#faucet-msg').html(alert.loading);
        await requestFunds(token, address);
    } else {
        // console.log('Invalid Address!');
        $('#faucet-msg').html(alert.errorInvalid);
    }
});

$('#btn-token').click(async function(e) {
    e.preventDefault();
    let token = $( "#token option:selected" ).text().toString().toLowerCase();
    // Get Token Data
    let apiResponse = await axios.get('/token', {
        params: {
            key: token
        }
    });
    console.log('apiResponse:', apiResponse);

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
    console.log('apiResponse:', apiResponse);
    $('#faucet-msg').html(alert.success);
}

