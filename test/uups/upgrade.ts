import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { deployUpgradeModuleFixture } from "./utils.js";
import { getAddress } from "viem";

describe("ProxyManager", async () => {
  const { networkHelpers, viem } = await network.connect();

  describe("Upgrade from V1 to V2", () => {
    it("should prevent re-initialization and keep previous storage", async () => {
      const { proxyBoxV2Contract, mainUser } = await networkHelpers.loadFixture(
        deployUpgradeModuleFixture
      );

      await viem.assertions.revertWithCustomError(
        proxyBoxV2Contract.write.initialize(["cristh"]),
        proxyBoxV2Contract,
        "InvalidInitialization"
      );

      assert.equal(
        await proxyBoxV2Contract.read.owner(),
        getAddress(mainUser.account.address)
      );
      assert.equal(await proxyBoxV2Contract.read.getName(), "lucciano");
      assert.equal(await proxyBoxV2Contract.read.getVersion(), "2.0.0");
    });

    it("should migrate to new logic", async () => {
      const { proxyBoxV2Contract } = await networkHelpers.loadFixture(
        deployUpgradeModuleFixture
      );

      assert.equal(await proxyBoxV2Contract.read.getMagicNumber(), BigInt(1));

      const magicNumber = BigInt(1993);
      const incrementer = BigInt(10);
      await proxyBoxV2Contract.write.setMagicNumber([magicNumber, incrementer]);
      assert.equal(
        await proxyBoxV2Contract.read.getMagicNumber(),
        magicNumber + incrementer
      );
    });
  });
});
