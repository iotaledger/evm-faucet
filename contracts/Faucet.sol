// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

interface IERC20 {
    
     /**
     * @dev returns the tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

     /**
     * @dev returns the decimal places of a token
     */
    function decimals() external view returns (uint8);

    /**
     * @dev transfers the `amount` of tokens from caller's account
     * to the `recipient` account.
     *
     * returns boolean value indicating the operation status.
     *
     * Emits a {Transfer} event
     */
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);
 
}

contract Faucet {

    // The underlying token of the Faucet
    IERC20 token;

    // The address of the faucet owner
    address owner;

    // For rate limiting
    mapping(address=>uint256) nextRequestAt;

    // No.of tokens to send when requested
    uint256 faucetDripAmount = 100 * 10 ** 18;

    // Max amount of tokens to owned by an address
    uint256 maxAmountToOwn = 100000 * 10 ** 18;

    // Sets the addresses of the Owner and the underlying token
    constructor (address _tokenAddress) {
        token = IERC20(_tokenAddress);
        owner = msg.sender;
    }

    // Verifies whether the caller is the owner 
    modifier onlyOwner{
        require(msg.sender == owner,"FaucetError: Caller not owner");
        _;
    }

    // Updates the underlying token address
     function setTokenAddress(address _tokenAddr) external onlyOwner {
        token = IERC20(_tokenAddr);
    }    

    // Updates the drip rate
     function setFaucetDripAmount(uint256 _amount) external onlyOwner {
        faucetDripAmount = _amount;
    }  

    // Allows the owner to withdraw tokens from the contract.
    function requestFunds(address _receiver) external onlyOwner {
        require(token.balanceOf(address(this)) >= faucetDripAmount,"FaucetError: Insufficient funds");
        require(token.balanceOf(_receiver) >= maxAmountToOwn,"FaucetError: You greedy bastard");
        token.transfer(_receiver, faucetDripAmount);
    }
}
