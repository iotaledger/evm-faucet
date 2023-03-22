// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WrappedToken is ERC20 {
    constructor() ERC20("WEN", "$WEN") {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }
}
