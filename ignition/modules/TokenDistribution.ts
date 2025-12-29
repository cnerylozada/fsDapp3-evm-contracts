import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { CLAIM_ALLOWANCES, generateTree } from "../../scripts/merkle.js";

const TokenDistributionModule = buildModule("TokenDistributionModule", (m) => {
  const { tree } = generateTree(CLAIM_ALLOWANCES);
  const _root = m.getParameter("root", tree.getHexRoot());
  const tokenDistributionContract = m.contract("TokenDistribution", [_root]);

  return { tokenDistributionContract };
});

export default TokenDistributionModule;
