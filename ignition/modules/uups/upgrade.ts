import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ProxyManagerModule from "./proxyManager.js";

const UpgradeModule = buildModule("UpgradeModule", (m) => {
  const { proxyContract, proxyBoxV1Contract } = m.useModule(ProxyManagerModule);
  m.call(proxyBoxV1Contract, "setMagicNumber", [BigInt(1)]);

  const boxV2Contract = m.contract("BoxV2", []);
  m.call(proxyBoxV1Contract, "upgradeToAndCall", [boxV2Contract, "0x"]);

  const proxyBoxV2Contract = m.contractAt("BoxV2", proxyContract, {
    id: "proxyBoxV2Contract",
  });
  m.call(proxyBoxV2Contract, "initialize", ["lucciano"]);
  return { proxyBoxV2Contract };
});

export default UpgradeModule;
