// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MerkleAirdropMinter is EIP712, Ownable {
    error MerkleAirdropMinter__NotInWhiteList();
    error MerkleAirdropMinter__InvalidAmountToClaim();
    error MerkleAirdropMinter__InvalidSignature();
    error MerkleAirdropMinter__TransferError();

    event ClaimTokens(address indexed user, uint amount);
    event WithdrawToken(address indexed user, uint amount);

    bytes32 immutable i_root;
    mapping(address => uint) s_userToClaimed;
    address immutable i_tokenAddress;

    struct AirdropClaim {
        address account;
        uint256 amount;
    }
    bytes32 constant MESSAGE_TYPE_HASH =
        keccak256("AirdropClaim(address account,uint256 amount)");

    constructor(
        address _initialOwner,
        bytes32 _root,
        address _tokenAddress
    ) EIP712("MerkleAirdropMinter", "1.0.0") Ownable(_initialOwner) {
        i_root = _root;
        i_tokenAddress = _tokenAddress;
    }

    function claimTokens(
        address _beneficiary,
        uint _claimAmount,
        uint _maxClaimableAmount,
        bytes32[] calldata _proof,
        bytes calldata _signature
    ) external {
        if (
            _claimAmount == 0 ||
            !isInWhiteList(_beneficiary, _maxClaimableAmount, _proof)
        ) {
            revert MerkleAirdropMinter__NotInWhiteList();
        }
        if (
            s_userToClaimed[_beneficiary] + _claimAmount > _maxClaimableAmount
        ) {
            revert MerkleAirdropMinter__InvalidAmountToClaim();
        }
        bytes32 digest = getMessageHash(_beneficiary, _claimAmount);
        if (!isValidSignature(digest, _signature, _beneficiary)) {
            revert MerkleAirdropMinter__InvalidSignature();
        }

        s_userToClaimed[_beneficiary] += _claimAmount;
        IERC20 token = IERC20(i_tokenAddress);
        bool isSuccess = token.transfer(_beneficiary, _claimAmount);
        if (!isSuccess) {
            revert MerkleAirdropMinter__TransferError();
        }
        emit ClaimTokens(_beneficiary, _claimAmount);
    }

    function isInWhiteList(
        address _user,
        uint _maxClaimableAmount,
        bytes32[] calldata _proof
    ) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encode(_user, _maxClaimableAmount));
        return MerkleProof.verify(_proof, i_root, leaf);
    }

    function isValidSignature(
        bytes32 _digest,
        bytes calldata _signature,
        address _signer
    ) public pure returns (bool) {
        (address recovered, , ) = ECDSA.tryRecover(_digest, _signature);
        return recovered == _signer;
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

    function getMessageHash(
        address _account,
        uint256 _amount
    ) internal view returns (bytes32) {
        bytes32 hash = keccak256(
            abi.encode(
                MESSAGE_TYPE_HASH,
                AirdropClaim({account: _account, amount: _amount})
            )
        );
        return _hashTypedDataV4(hash);
    }
}
