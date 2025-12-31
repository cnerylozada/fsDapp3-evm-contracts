// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract BoxV1 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    uint s_magicNumber;

    constructor() {
        _disableInitializers();
    }

    function initialize(address _owner, uint _magicNumber) public initializer {
        __Ownable_init(_owner);
        s_magicNumber = _magicNumber;
    }

    function getMagicNumber() external view returns (uint) {
        return s_magicNumber;
    }

    function setMagicNumber(uint _magicNumber) external {
        s_magicNumber = _magicNumber;
    }

    function getVersion() external pure returns (string memory) {
        return "1.0.0";
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
