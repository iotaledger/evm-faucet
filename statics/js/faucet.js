'use strict';

$('#btn-faucet').click(function (e) {
    e.preventDefault();
    let address = $('#address').val();
    let token = $( "#token option:selected" ).text();
    if (validateAddress(address) === true) {
        console.log('Requesting', token, 'for', address);
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
