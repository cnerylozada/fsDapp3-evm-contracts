// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract BoxV2 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    uint s_magicNumber;
    string s_name;

    constructor() {
        _disableInitializers();
    }

    // TODO: initialize new storage variables
    // function initialize() public initializer {
    //     __UUPSUpgradeable_init();
    // }

    function getMagicNumber() external view returns (uint) {
        return s_magicNumber;
    }

    function setMagicNumber(uint _number) external {
        s_magicNumber = _number + 100;
    }

    function getVersion() external pure returns (string memory) {
        return "2.0.0";
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
