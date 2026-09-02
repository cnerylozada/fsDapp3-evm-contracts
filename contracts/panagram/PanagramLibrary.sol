// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

library PanagramLibrary {
    uint64 constant BACKEND_SIGNER_ROLE = 1;
    uint constant PUBLIC_INPUT_CLAIMER_INDEX = 0;
    uint constant PUBLIC_INPUT_ROUND_ID_INDEX = 2;
    uint constant PUBLIC_INPUT_NULLIFIER_INDEX = 3;

    struct RoundAttestation {
        uint256 roundId;
    }
    bytes32 constant MESSAGE_TYPE_HASH =
        keccak256("RoundAttestation(uint256 roundId)");

    function addressToBytes32(address _user) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(_user)));
    }

    function hashRoundAttestation(
        uint256 _roundId
    ) internal pure returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(MESSAGE_TYPE_HASH, RoundAttestation({roundId: _roundId}))
        );
        return structHash;
    }

    function recoverSigner(
        bytes32 _digest,
        bytes calldata _signature
    ) internal pure returns (address) {
        (address recovered, , ) = ECDSA.tryRecover(_digest, _signature);
        return recovered;
    }
}
