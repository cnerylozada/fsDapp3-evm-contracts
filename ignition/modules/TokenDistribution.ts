import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TokenDistributionModule = buildModule("TokenDistributionModule", (m) => {
  const _root = m.getParameter("root");
  const tokenDistributionContract = m.contract("TokenDistribution", [_root]);

  return { tokenDistributionContract };
});

export default TokenDistributionModule;
