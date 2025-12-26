// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract TokenDistribution {
    error TokenDistribution__InvalidClaim();

    bytes32 immutable i_root;
    mapping(address => uint) s_userToClaimed;

    constructor(bytes32 _root) {
        i_root = _root;
    }

    function claimTokens(
        address _user,
        uint _claimAmount,
        uint _maxClaimableAmount,
        bytes32[] memory _proof
    ) external {
        address claimer = msg.sender;
        if (
            _user != msg.sender ||
            (s_userToClaimed[claimer] + _claimAmount > _maxClaimableAmount) ||
            !verify(claimer, _proof)
        ) revert TokenDistribution__InvalidClaim();

        s_userToClaimed[claimer] += _claimAmount;
    }

    function getClaimedByUser(address _user) external view returns (uint) {
        return s_userToClaimed[_user];
    }

    function verify(
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
