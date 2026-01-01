import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { CLAIM_ALLOWANCES, generateTree } from "../../../scripts/merkle.js";

const MerkleAirdropMinterModule = buildModule(
  "MerkleAirdropMinterModule",
  (m) => {
    const { tree } = generateTree(CLAIM_ALLOWANCES);
    const _root = m.getParameter("root", tree.getHexRoot());
    const merkleAirdropMinterContract = m.contract("MerkleAirdropMinter", [
      _root,
    ]);

    return { merkleAirdropMinterContract };
  }
);

export default MerkleAirdropMinterModule;
