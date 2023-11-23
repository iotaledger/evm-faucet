// Copyright 2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Simple ERC20 Token
/// @dev Extends ERC20 token with customizable decimals and an initial supply
contract SimpleERC20Token is ERC20 {
    /// @notice Total number of decimals the token uses
    /// @dev This variable can be used for better presentation of the token's value
    uint8 private _decimals;

    /// @notice Total initial supply of tokens
    /// @dev Set upon contract deployment to a fixed value, including to the specified number of decimals
    uint256 public INITIAL_SUPPLY;

    /// @notice Contract constructor that sets up the ERC20 token
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param _initialDecimals The number of decimals for token calculations
    /// @param initialAccount The address that will receive the initial token supply
    constructor(
        string memory name,
        string memory symbol,
        uint8 _initialDecimals,
        address initialAccount
    ) ERC20(name, symbol) {
        _decimals = _initialDecimals;
        INITIAL_SUPPLY = 100_000_000_000 * (10 ** uint256(_initialDecimals));
        _mint(initialAccount, INITIAL_SUPPLY);
    }

    /// @notice Retrieves the number of decimals used by the token
    /// @return The number of decimals for precision
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
