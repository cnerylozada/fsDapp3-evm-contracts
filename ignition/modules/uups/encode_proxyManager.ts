import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EncodeProxyManagerModule = buildModule(
  "EncodeProxyManagerModule",
  (m) => {
    const boxV1Contract = m.contract("BoxV1", []);

    // abi.encodeWithSignature("initialize(uint256,address)", 1993, owner)
    const encodeInitParams =
      "0xcd6dc687000000000000000000000000de645d7dc8f33dbc92dd970d408a9f9cf50ecd1b00000000000000000000000000000000000000000000000000000000000007c9";

    const proxyContract = m.contract("ProxyManager", [
      boxV1Contract,
      encodeInitParams,
    ]);

    const proxyBoxV1Contract = m.contractAt("BoxV1", proxyContract, {
      id: "proxyBoxV1Contract",
    });
    return { proxyContract, proxyBoxV1Contract };
  }
);

export default EncodeProxyManagerModule;
