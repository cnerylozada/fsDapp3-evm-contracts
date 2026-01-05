// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MerkleAirdropMinter is Ownable {
    error MerkleAirdropMinter__InvalidClaim();
    error MerkleAirdropMinter__TransferError();
    event ClaimTokens(address indexed user, uint amount);
    event WithdrawToken(address indexed user, uint amount);

    bytes32 immutable i_root;
    mapping(address => uint) s_userToClaimed;
    address immutable i_tokenAddress;

    constructor(
        address _initialOwner,
        bytes32 _root,
        address _tokenAddress
    ) Ownable(_initialOwner) {
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
            _claimAmount == 0 ||
            !isInWhiteList(claimer, _maxClaimableAmount, _proof)
        ) {
            revert MerkleAirdropMinter__InvalidClaim();
        }
        if (s_userToClaimed[claimer] + _claimAmount > _maxClaimableAmount) {
            revert MerkleAirdropMinter__InvalidClaim();
        }

        s_userToClaimed[claimer] += _claimAmount;
        IERC20 token = IERC20(i_tokenAddress);
        bool isSuccess = token.transfer(claimer, _claimAmount);
        if (!isSuccess) {
            revert MerkleAirdropMinter__TransferError();
        }
        emit ClaimTokens(claimer, _claimAmount);
    }

    function withdrawTokens(address _to, uint _amount) external onlyOwner {
        IERC20 token = IERC20(i_tokenAddress);
        bool isSuccess = token.transfer(_to, _amount);
        if (!isSuccess) {
            revert MerkleAirdropMinter__TransferError();
        }
        emit WithdrawToken(_to, _amount);
    }

    function getClaimedByUser(address _user) external view returns (uint) {
        return s_userToClaimed[_user];
    }

    function getTokenBalance() external view returns (uint) {
        return IERC20(i_tokenAddress).balanceOf(address(this));
    }

    function isInWhiteList(
        address _user,
        uint _maxClaimableAmount,
        bytes32[] memory _proof
    ) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encode(_user, _maxClaimableAmount));
        return MerkleProof.verify(_proof, i_root, leaf);
    }
}
