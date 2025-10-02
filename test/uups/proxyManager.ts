import { network } from "hardhat";
import ProxyManagerModule from "../../ignition/modules/uups/proxyManager.js";
import UpgradeModule from "../../ignition/modules/uups/upgrade.js";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getAddress } from "viem";

describe("ProxyManager", async function () {
  const { networkHelpers } = await network.connect();
  const { viem } = await network.connect();
  const { ignition } = await network.connect();

  async function deployProxyManagerModuleFixture() {
    const [mainUser] = await viem.getWalletClients();

    const { proxyContract, proxyBoxV1Contract } = await ignition.deploy(
      ProxyManagerModule
    );
    return {
      mainUser,
      proxyContract,
      proxyBoxV1Contract,
    };
  }

  function deployUpgradeModuleFixture(_proxyContract: string) {
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

  describe("deployment impl BoxV1", () => {
    it("should initialize params", async function () {
      const { proxyContract, proxyBoxV1Contract, mainUser } =
        await networkHelpers.loadFixture(deployProxyManagerModuleFixture);
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
        deployProxyManagerModuleFixture
      );

      const magicNumber = BigInt(2025);
      await proxyBoxV1Contract.write.setMagicNumber([magicNumber]);

      assert.equal(magicNumber, await proxyBoxV1Contract.read.getMagicNumber());
    });
  });

  describe("upgrade", () => {
    it("should migrate to new logic", async () => {
      const { proxyBoxV1Contract } = await networkHelpers.loadFixture(
        deployProxyManagerModuleFixture
      );
      assert.equal("1.0.0", await proxyBoxV1Contract.read.getVersion());

      const { proxyBoxV2Contract } = await networkHelpers.loadFixture(
        deployUpgradeModuleFixture(proxyBoxV1Contract.address)
      );
      assert.equal("2.0.0", await proxyBoxV2Contract.read.getVersion());

      const oldMagicNumber = await proxyBoxV2Contract.read.getMagicNumber();
      console.log(`oldMagicNumber`, oldMagicNumber);
      const magicNumber = BigInt(1993);
      await proxyBoxV1Contract.write.setMagicNumber([magicNumber]);

      assert.equal(
        magicNumber + BigInt(100),
        await proxyBoxV2Contract.read.getMagicNumber()
      );
    });
  });
});
