import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("ProxyManager", async () => {
  const { networkHelpers, viem, ignition } = await network.connect();

  describe("upgrade", () => {
    it("should migrate to new logic", async () => {
      //   const { proxyBoxV1Contract } = await networkHelpers.loadFixture(
      //     deployProxyManagerModuleFixture
      //   );
      //   assert.equal("1.0.0", await proxyBoxV1Contract.read.getVersion());
      //   const { proxyBoxV2Contract } = await networkHelpers.loadFixture(
      //     deployUpgradeModuleFixture(proxyBoxV1Contract.address)
      //   );
      //   assert.equal("2.0.0", await proxyBoxV2Contract.read.getVersion());
      //   const oldMagicNumber = await proxyBoxV2Contract.read.getMagicNumber();
      //   console.log(`oldMagicNumber`, oldMagicNumber);
      //   const magicNumber = BigInt(1993);
      //   await proxyBoxV1Contract.write.setMagicNumber([magicNumber]);
      //   assert.equal(
      //     magicNumber + BigInt(100),
      //     await proxyBoxV2Contract.read.getMagicNumber()
      //   );
    });
  });
});
