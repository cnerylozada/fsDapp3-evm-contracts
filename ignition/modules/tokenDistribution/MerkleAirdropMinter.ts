import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { generateTree } from "../../../scripts/merkle.js";
import MyTokenModule from "./MyToken.js";
import { parseEther } from "viem";

const MerkleAirdropMinterModule = buildModule(
  "MerkleAirdropMinterModule",
  (m) => {
    const { myTokenContract } = m.useModule(MyTokenModule);

    const defaultAdmin = m.getAccount(0);
    const { tree } = generateTree();
    const root = tree.getHexRoot();
    const merkleAirdropMinterContract = m.contract("MerkleAirdropMinter", [
      defaultAdmin,
      root,
      myTokenContract,
    ]);

    m.call(myTokenContract, "transfer", [
      merkleAirdropMinterContract,
      parseEther("200000"),
    ]);

    return { merkleAirdropMinterContract, myTokenContract };
  }
);

export default MerkleAirdropMinterModule;
