'use strict';

$('#btn-faucet').click(async function (e) {
    e.preventDefault();
    let address = $('#address').val();
    let token = $( "#token option:selected" ).text();
    let addressValidated = await validateAddress(address);
    if (addressValidated === true) {
        $('#faucet-msg').html(alert.loading);
        await requestFunds(token, address);
    } else {
        // console.log('Invalid Address!');
        $('#faucet-msg').html(alert.errorInvalid);
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
