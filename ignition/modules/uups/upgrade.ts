import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const UpgradeModule = buildModule("UpgradeModule", (m) => {
  const lastProxyContract = "0x8CD4394739dF9205939C2aA109335aaf2571E339";
  const _proxyContract = m.getParameter("_proxyContract", lastProxyContract);

  const proxyBoxV1Contract = m.contractAt("BoxV1", _proxyContract);

  const boxV2Contract = m.contract("BoxV2", []);
  m.call(proxyBoxV1Contract, "upgradeToAndCall", [boxV2Contract, "0x"]);

  const proxyBoxV2Contract = m.contractAt("BoxV2", _proxyContract, {
    id: "proxyBoxV2Contract",
  });

  return { proxyBoxV2Contract };
});

export default UpgradeModule;
