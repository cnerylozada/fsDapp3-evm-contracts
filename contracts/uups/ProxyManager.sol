// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract ProxyManager is ERC1967Proxy {
    constructor(
        address logic,
        bytes memory initData
    ) ERC1967Proxy(logic, initData) {}
}
