// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {IVerifier} from "./IVerifier.sol";

contract Panagram is AccessManaged, ERC721, ERC721URIStorage {
    IVerifier immutable i_zkVerifierContract;
    mapping(bytes32 => bool) s_isNullfierUsed;
    uint256 private _nextTokenId;

    uint constant PUBLIC_INPUT_CLAIMER_INDEX = 0;
    uint constant PUBLIC_INPUT_NULLIFIER_INDEX = 3;

    string constant EASY_METADATA_URI =
        "https://coral-giant-donkey-508.mypinata.cloud/ipfs/bafkreibv3myd2t7p2dx7exo3wfjsry2swfapum6nvfbqsfj6qjgdjifn6a";

    error Panagram__ProofNotBoundToClaimer();
    error Panagram__InvalidProof();
    error Panagram__NullfierAlreadyUsed();

    constructor(
        address _initialAuthority,
        address _zkVerifierContract
    ) AccessManaged(_initialAuthority) ERC721("Panagram ZK", "PNG_ZK") {
        i_zkVerifierContract = IVerifier(_zkVerifierContract);
    }

    function claimReward(
        bytes calldata _proof,
        bytes32[] calldata _publicInput
    ) external returns (uint256) {
        address claimer = msg.sender;

        if (
            addressToBytes32(claimer) !=
            _publicInput[PUBLIC_INPUT_CLAIMER_INDEX]
        ) revert Panagram__ProofNotBoundToClaimer();

        bytes32 nullifier = _publicInput[PUBLIC_INPUT_NULLIFIER_INDEX];
        if (s_isNullfierUsed[nullifier]) revert Panagram__NullfierAlreadyUsed();

        if (!i_zkVerifierContract.verify(_proof, _publicInput))
            revert Panagram__InvalidProof();

        uint256 tokenId = _nextTokenId++;
        _safeMint(claimer, tokenId);
        _setTokenURI(tokenId, EASY_METADATA_URI);
        return tokenId;
    }

    function addressToBytes32(address _user) public view returns (bytes32) {
        return bytes32(uint256(uint160(_user)));
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
