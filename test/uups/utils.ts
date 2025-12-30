import { network } from "hardhat";
import ProxyManagerModule from "../../ignition/modules/uups/proxyManager.js";
import UpgradeModule from "../../ignition/modules/uups/upgrade.js";

const { viem, ignition } = await network.connect();

export async function deployProxyManagerModuleFixture() {
  const [mainUser] = await viem.getWalletClients();

  const { boxV1Contract, proxyContract, proxyBoxV1Contract } =
    await ignition.deploy(ProxyManagerModule);

  return {
    mainUser,
    boxV1Contract,
    proxyContract,
    proxyBoxV1Contract,
  };
}

export function deployUpgradeModuleFixture(_proxyContract: string) {
  return async function fixture() {
    const { proxyBoxV2Contract } = await ignition.deploy(UpgradeModule, {
      parameters: {
        UpgradeModule: {
          _proxyContract,
        },
      },
    });
    return {
      proxyBoxV2Contract,
    };
  };
}
