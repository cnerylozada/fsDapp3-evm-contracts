import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ProxyManagerModule = buildModule("ProxyManagerModule", (m) => {
  const boxV1Contract = m.contract("BoxV1", []);
  const proxyContract = m.contract("ProxyManager", [boxV1Contract, "0x"]);

  const proxyBoxV1Contract = m.contractAt("BoxV1", proxyContract, {
    id: "proxyBoxV1Contract",
  });
  const _owner = m.getAccount(0);
  const _magicNumber = BigInt(9);
  m.call(proxyBoxV1Contract, "initialize", [_owner, _magicNumber]);

  return {
    boxV1Contract,
    proxyContract,
    proxyBoxV1Contract,
  };
});

export default ProxyManagerModule;
