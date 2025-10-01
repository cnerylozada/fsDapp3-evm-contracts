import { network } from "hardhat";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import ProxyManagerModule from "../../ignition/modules/uups/proxyManager.js";
import { getAddress } from "viem";

describe("ProxyManager", async function () {
  const { networkHelpers } = await network.connect();
  const { viem } = await network.connect();

  async function deployCounterModuleFixture() {
    const [mainUser] = await viem.getWalletClients();

    const { ignition } = await network.connect();
    const { proxyContract, proxyBoxV1Contract } = await ignition.deploy(
      ProxyManagerModule
    );

    return { mainUser, proxyContract, proxyBoxV1Contract };
  }

  describe("deployment impl BoxV1", () => {
    it("should initialize params", async function () {
      const { proxyContract, proxyBoxV1Contract, mainUser } =
        await networkHelpers.loadFixture(deployCounterModuleFixture);
      assert.equal(proxyContract.address, proxyBoxV1Contract.address);

      assert.equal(
        getAddress(mainUser.account.address),
        getAddress(await proxyBoxV1Contract.read.owner())
      );

      const magicNumber = BigInt(2000);
      assert.equal(magicNumber, await proxyBoxV1Contract.read.getMagicNumber());
    });
  });

  describe("setMagicNumber", () => {
    it("should set a new magicNumber", async () => {
      const { proxyBoxV1Contract } = await networkHelpers.loadFixture(
        deployCounterModuleFixture
      );
      const magicNumber = BigInt(1993);
      await proxyBoxV1Contract.write.setMagicNumber([magicNumber]);

      assert.equal(magicNumber, await proxyBoxV1Contract.read.getMagicNumber());
    });
  });
});
