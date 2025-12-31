import { network } from "hardhat";
import ProxyManagerModule from "../../ignition/modules/uups/proxyManager.js";
import UpgradeModule from "../../ignition/modules/uups/upgrade.js";

const { viem, ignition } = await network.connect();

export async function deployProxyManagerModuleFixture() {
  const [mainUser, otherAccount] = await viem.getWalletClients();

  const { boxV1Contract, proxyContract, proxyBoxV1Contract } =
    await ignition.deploy(ProxyManagerModule);

  return {
    mainUser,
    otherAccount,
    boxV1Contract,
    proxyContract,
    proxyBoxV1Contract,
  };
}

export async function deployUpgradeModuleFixture() {
  const [mainUser, otherAccount] = await viem.getWalletClients();

  const { proxyBoxV2Contract } = await ignition.deploy(UpgradeModule);
  return {
    proxyBoxV2Contract,
    mainUser,
    otherAccount,
  };
}
