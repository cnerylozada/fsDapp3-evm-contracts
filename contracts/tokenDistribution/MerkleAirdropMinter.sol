// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleAirdropMinter {
    error MerkleAirdropMinter__InvalidClaim();

    bytes32 immutable i_root;
    mapping(address => uint) s_userToClaimed;

    constructor(bytes32 _root) {
        i_root = _root;
    }

    function claimTokens(
        uint _claimAmount,
        uint _maxClaimableAmount,
        bytes32[] memory _proof
    ) external {
        address claimer = msg.sender;
        if (
            (s_userToClaimed[claimer] + _claimAmount > _maxClaimableAmount) ||
            !isInWhiteList(claimer, _proof)
        ) revert MerkleAirdropMinter__InvalidClaim();

        s_userToClaimed[claimer] += _claimAmount;
    }

    function getClaimedByUser(address _user) external view returns (uint) {
        return s_userToClaimed[_user];
    }

    function isInWhiteList(
        address _user,
        bytes32[] memory _proof
    ) public view returns (bool) {
        return
            MerkleProof.verify(
                _proof,
                i_root,
                keccak256(abi.encodePacked(_user))
            );
    }
}
