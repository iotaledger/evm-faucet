// Copyright 2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title ERC20 Token Faucet Contract
/// @notice This contract provides an automated distribution system for ERC20 tokens
/// primarily for use in testing and development environments. The contract allows
/// accounts with the `FAUCET_ADMIN_ROLE` to distribute tokens to other addresses,
/// enabling testing of token-based systems without the need for real value transfer.
/// @dev Inherits from OpenZeppelin's AccessControl for role-based permission management.
contract Faucet is AccessControl {
    /// @dev The ERC20 token instance that the Faucet will dispense.
    IERC20Metadata public token;

    /// @notice The amount of tokens that the contract dispenses on each request.
    uint256 public faucetDripAmount;

    /// @notice The maximum token balance an address can hold to be eligible to receive Faucet tokens.
    uint256 public maxAmountToOwn;

    /// @notice Initializes the Faucet contract, assigning the default admin role to the deployer
    /// and setting the ERC20 token instance that the Faucet will dispense, along with initial settings.
    /// @param _tokenAddress The contract address of the ERC20 token that will be distributed by the Faucet.
    constructor(address _tokenAddress, address _faucetAdmin) {

        require(_faucetAdmin != address(0), "FaucetError: admin address required");

        _grantRole(DEFAULT_ADMIN_ROLE, _faucetAdmin);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        token = IERC20Metadata(_tokenAddress);
        setFaucetDripAmount(100);
        setMaxAmountToOwn(100000);
    }


    /// @notice Sets the ERC20 token that the Faucet will distribute and updates
    /// `faucetDripAmount` and `maxAmountToOwn` based on the token's `decimals()`.
    /// @dev Only callable by accounts with the `FAUCET_ADMIN_ROLE`. The method updates
    /// token-related configurations to use the correct decimal values of the new token.
    /// @param _tokenAddr The contract address of the new ERC20 token.
    function setTokenAddress(address _tokenAddr) external onlyRole(DEFAULT_ADMIN_ROLE) {
        token = IERC20Metadata(_tokenAddr);
        setFaucetDripAmount(100);
        setMaxAmountToOwn(100000);
    }

    /// @notice Sets the amount of tokens that the Faucet will dispense per request.
    /// The amount must be specified without considering decimal places and will
    /// be adjusted according to the token's `decimals()`.
    /// @dev Only callable by accounts with the `FAUCET_ADMIN_ROLE`.
    /// @param _amountWithoutDecimals The amount to set, specified without decimals.
    function setFaucetDripAmount(uint256 _amountWithoutDecimals) public onlyRole(DEFAULT_ADMIN_ROLE) {
        uint8 decimals = token.decimals();
        faucetDripAmount = _amountWithoutDecimals * (10 ** uint256(decimals));
    }

    /// @notice Updates the maximum token balance an address can hold to remain eligible
    /// to receive tokens from the Faucet. The value must be specified without considering
    /// decimal places and will be adjusted according to the token's `decimals()`.
    /// @dev Only callable by accounts with the `FAUCET_ADMIN_ROLE`.
    /// @param _maxBalanceWithoutDecimals The value to set, specified without decimals.
    function setMaxAmountToOwn(uint256 _maxBalanceWithoutDecimals) public onlyRole(DEFAULT_ADMIN_ROLE) {
        uint8 decimals = token.decimals();
        maxAmountToOwn = _maxBalanceWithoutDecimals * (10 ** uint256(decimals));
    }

    /// @notice Distributes the `faucetDripAmount` of tokens to the provided address
    /// if the conditions of the Faucet contract are met.
    /// @dev Only callable by accounts with the `FAUCET_ADMIN_ROLE`. The Faucet
    /// must have sufficient tokens and the receiver's balance must be below
    /// `maxAmountToOwn` for the request to succeed.
    /// @param _receiver The address that will receive the tokens.
    function requestFunds(address _receiver) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token.balanceOf(address(this)) >= faucetDripAmount, "FaucetError: Insufficient funds in faucet");
        require(token.balanceOf(_receiver) <= maxAmountToOwn, "FaucetError: Receiver's token balance exceeds maximum allowed");
        token.transfer(_receiver, faucetDripAmount);
    }
}
