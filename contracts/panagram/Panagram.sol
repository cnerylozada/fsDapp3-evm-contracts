// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {IVerifier} from "./IVerifier.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {IAccessManager} from "@openzeppelin/contracts/access/manager/IAccessManager.sol";
import {PanagramLibrary} from "./PanagramLibrary.sol";

contract Panagram is AccessManaged, ERC721, ERC721URIStorage, EIP712 {
    IAccessManager immutable i_accessManagerContract;
    IVerifier immutable i_zkVerifierContract;

    mapping(bytes32 => bool) s_isNullfierUsed;
    uint256 private _nextTokenId;

    string constant EASY_METADATA_URI =
        "https://coral-giant-donkey-508.mypinata.cloud/ipfs/bafkreibv3myd2t7p2dx7exo3wfjsry2swfapum6nvfbqsfj6qjgdjifn6a";

    error Panagram__ProofNotBoundToClaimer();
    error Panagram__InvalidRoundAttestation();
    error Panagram__InvalidProof();
    error Panagram__NullfierAlreadyUsed();

    constructor(
        address _initialAuthority,
        address _zkVerifierContract
    )
        AccessManaged(_initialAuthority)
        ERC721("Panagram ZK", "PNG_ZK")
        EIP712("Panagram", "1.0.0")
    {
        i_accessManagerContract = IAccessManager(_initialAuthority);
        i_zkVerifierContract = IVerifier(_zkVerifierContract);
    }

    function claimReward(
        bytes calldata _proof,
        bytes32[] calldata _publicInput,
        bytes calldata _signature
    ) external returns (uint256) {
        address claimer = msg.sender;

        if (
            PanagramLibrary.addressToBytes32(claimer) !=
            _publicInput[PanagramLibrary.PUBLIC_INPUT_CLAIMER_INDEX]
        ) revert Panagram__ProofNotBoundToClaimer();

        uint roundId = uint(
            _publicInput[PanagramLibrary.PUBLIC_INPUT_ROUND_ID_INDEX]
        );
        bytes32 digest = _hashTypedDataV4(
            PanagramLibrary.hashRoundAttestation(roundId)
        );
        (bool isBackendSigner, ) = i_accessManagerContract.hasRole(
            PanagramLibrary.BACKEND_SIGNER_ROLE,
            PanagramLibrary.recoverSigner(digest, _signature)
        );
        if (!isBackendSigner) revert Panagram__InvalidRoundAttestation();

        bytes32 nullifier = _publicInput[
            PanagramLibrary.PUBLIC_INPUT_NULLIFIER_INDEX
        ];
        if (s_isNullfierUsed[nullifier]) revert Panagram__NullfierAlreadyUsed();
        s_isNullfierUsed[nullifier] = true;

        if (!i_zkVerifierContract.verify(_proof, _publicInput))
            revert Panagram__InvalidProof();

        uint256 tokenId = _nextTokenId++;
        _safeMint(claimer, tokenId);
        _setTokenURI(tokenId, EASY_METADATA_URI);
        return tokenId;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
