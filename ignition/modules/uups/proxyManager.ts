import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ProxyManagerModule = buildModule("ProxyManagerModule", (m) => {
  const boxV1Contract = m.contract("BoxV1", []);

  const proxyContract = m.contract("ProxyManager", [
    boxV1Contract,
    "0xda35a26f00000000000000000000000000000000000000000000000000000000000007c9000000000000000000000000de645d7dc8f33dbc92dd970d408a9f9cf50ecd1b",
  ]);

  const proxyBoxV1Contract = m.contractAt("BoxV1", proxyContract, {
    id: "proxyBoxV1Contract",
  });
  return { proxyContract, proxyBoxV1Contract };
});

export default ProxyManagerModule;
