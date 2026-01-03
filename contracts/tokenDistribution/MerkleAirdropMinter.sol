// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MerkleAirdropMinter {
    error MerkleAirdropMinter__InvalidClaim();
    error MerkleAirdropMinter__TransferError();

    bytes32 immutable i_root;
    mapping(address => uint) s_userToClaimed;
    address immutable i_tokenAddress;

    constructor(bytes32 _root, address _tokenAddress) {
        i_root = _root;
        i_tokenAddress = _tokenAddress;
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
        IERC20 token = IERC20(i_tokenAddress);
        bool isSuccess = token.transfer(claimer, _claimAmount);
        if (!isSuccess) {
            revert MerkleAirdropMinter__TransferError();
        }
    }

    function getClaimedByUser(address _user) external view returns (uint) {
        return s_userToClaimed[_user];
    }

    function getTokenBalance() external view returns (uint) {
        return IERC20(i_tokenAddress).balanceOf(address(this));
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
