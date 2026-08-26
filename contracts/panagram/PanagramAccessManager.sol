// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/manager/AccessManager.sol";

contract PanagramAccessManager is AccessManager {
    constructor(address _initialAdmin) AccessManager(_initialAdmin) {}
}
