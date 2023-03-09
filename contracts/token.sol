// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WrappedETH is ERC20 {
    constructor() ERC20("Wrapped ETH", "wETH") {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }
}
