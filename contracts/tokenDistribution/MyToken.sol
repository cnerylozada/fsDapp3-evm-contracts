// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract MyToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(
        address _recipient,
        address _defaultAdmin,
        address _minter
    ) ERC20("MyToken", "MKT") {
        _mint(_recipient, 200_000 * 10 ** decimals());
        _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _grantRole(MINTER_ROLE, _minter);
    }

    function mint(address _to, uint _amount) public onlyRole(MINTER_ROLE) {
        _mint(_to, _amount);
    }
}
