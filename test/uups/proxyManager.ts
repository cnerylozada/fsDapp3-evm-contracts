import { network } from "hardhat";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import ProxyManagerModule from "../../ignition/modules/uups/proxyManager.js";
import { getAddress } from "viem";

describe("ProxyManager", async function () {
  const { networkHelpers } = await network.connect();
  const { viem } = await network.connect();
  const { ignition } = await network.connect();

  async function deployCounterModuleFixture() {
    const [mainUser] = await viem.getWalletClients();

    const {
      proxyContract,
      proxyBoxV1Contract,
      proxyBoxV2Contract,
      boxV2Contract,
    } = await ignition.deploy(ProxyManagerModule);

    return {
      mainUser,
      proxyContract,
      proxyBoxV1Contract,
      proxyBoxV2Contract,
      boxV2Contract,
    };
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

      const magicNumber = BigInt(2025);
      await proxyBoxV1Contract.write.setMagicNumber([magicNumber]);

      assert.equal(magicNumber, await proxyBoxV1Contract.read.getMagicNumber());
    });
  });

  describe("upgrade", () => {
    it("should migrate to new logic", async () => {
      const { proxyBoxV1Contract, boxV2Contract, proxyBoxV2Contract } =
        await networkHelpers.loadFixture(deployCounterModuleFixture);

      await proxyBoxV1Contract.write.upgradeToAndCall([
        boxV2Contract.address,
        "0x",
      ]);
      assert.equal("2.0.0", await proxyBoxV2Contract.read.getVersion());

      const oldMagicNumber = await proxyBoxV2Contract.read.getMagicNumber();
      console.log(`oldMagicNumber`, oldMagicNumber);

      const magicNumber = BigInt(2000);
      await proxyBoxV1Contract.write.setMagicNumber([magicNumber]);

      assert.equal(
        magicNumber + BigInt(100),
        await proxyBoxV2Contract.read.getMagicNumber()
      );
    });
  });
});
