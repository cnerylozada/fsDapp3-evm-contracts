import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { CLAIM_ALLOWANCES, generateTree } from "../../../scripts/merkle.js";
import MyTokenModule from "./MyToken.js";
import { parseEther } from "viem";

const MerkleAirdropMinterModule = buildModule(
  "MerkleAirdropMinterModule",
  (m) => {
    const { myTokenContract } = m.useModule(MyTokenModule);

    const { tree } = generateTree(CLAIM_ALLOWANCES);
    const _root = m.getParameter("root", tree.getHexRoot());
    const merkleAirdropMinterContract = m.contract("MerkleAirdropMinter", [
      _root,
      myTokenContract,
    ]);

    m.call(myTokenContract, "transfer", [
      merkleAirdropMinterContract,
      parseEther("200000"),
    ]);

    return { merkleAirdropMinterContract };
  }
);

export default MerkleAirdropMinterModule;
