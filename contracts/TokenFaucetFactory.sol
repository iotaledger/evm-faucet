// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import "./SimpleERC20Token.sol";
import "./Faucet.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Token Faucet Factory Contract
/// @notice This contract allows deployers to create ERC20 tokens with an associated Faucet contract
/// for distributing tokens freely.
/// @dev Inherits from OpenZeppelin's AccessControl contract to restrict certain functions
/// to users with specific roles.
contract TokenFaucetFactory is AccessControl {
    /// @dev Role identifier for factory administrator.
    bytes32 public constant FACTORY_ADMIN_ROLE = keccak256("FACTORY_ADMIN_ROLE");

    /// @dev Struct to keep track of token and its associated faucet.
    struct TokenFaucetPair {
        SimpleERC20Token token;
        Faucet faucet;
    }

    /// @dev Array of all deployed token and faucet pairs.
    TokenFaucetPair[] public deployedTokens;

    /// @notice Emitted when a new token and faucet are created.
    /// @param tokenAddress The address of the new token contract.
    /// @param faucetAddress The address of the new faucet contract.
    event TokenFaucetCreated(address indexed tokenAddress, address indexed faucetAddress);

    /// @dev Sets up the initial roles for the deploying address.
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FACTORY_ADMIN_ROLE, msg.sender);
    }

    /// @notice Creates a new ERC20 token and corresponding Faucet contract.
    /// @dev Both the token and the faucet are deployed and linked, and the initial
    /// supply is sent to the Faucet. An optional admin address can be specified
    /// for the Faucet contract.
    /// @param tokenName Name of the ERC20 token to be deployed.
    /// @param tokenSymbol Symbol of the ERC20 token to be deployed.
    /// @param tokenDecimals Number of decimals the ERC20 token uses.
    /// @param optionalAdminAddress If provided, Grants FAUCET_ADMIN_ROLE to this address on the new Faucet contract.
    /// @return newToken The newly created SimpleERC20Token contract instance.
    /// @return newFaucet The newly created Faucet contract instance.
    function createTokenAndFaucet(
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        address optionalAdminAddress
    ) public onlyRole(FACTORY_ADMIN_ROLE) returns (SimpleERC20Token, Faucet) {
        SimpleERC20Token newToken = new SimpleERC20Token(
            tokenName,
            tokenSymbol,
            tokenDecimals,
            address(this)
        );

        Faucet newFaucet = new Faucet(address(newToken), msg.sender);
        newFaucet.grantRole(newFaucet.DEFAULT_ADMIN_ROLE(), msg.sender);

        if (optionalAdminAddress != address(0)) {
            newFaucet.grantRole(newFaucet.DEFAULT_ADMIN_ROLE(), optionalAdminAddress);
        }

        require(newToken.transfer(address(newFaucet), newToken.INITIAL_SUPPLY()), "Token transfer failed");

        deployedTokens.push(TokenFaucetPair({
        token : newToken,
        faucet : newFaucet
        }));

        emit TokenFaucetCreated(address(newToken), address(newFaucet));

        return (newToken, newFaucet);
    }

    /// @notice Gets the total count of deployed token-faucet pairs.
    /// @dev Retrieves the length of the deployedTokens array.
    /// @return count The number of token-faucet pairs deployed by this contract.
    function getDeployedTokensCount() public view returns (uint256 count) {
        return deployedTokens.length;
    }

    /// @notice Retrieves a deployed token-faucet pair by its index.
    /// @dev Fetches a TokenFaucetPair from the deployedTokens array at the given index.
    /// Index must be within bounds of the array.
    /// @param index The index of the token-faucet pair in the deployedTokens array.
    /// @return TokenFaucetPair The TokenFaucetPair located at the specified index.
    function getDeployedTokenFaucetPair(uint256 index) public view returns (TokenFaucetPair memory) {
        require(index < deployedTokens.length, "Index out of bounds");
        return deployedTokens[index];
    }
}
