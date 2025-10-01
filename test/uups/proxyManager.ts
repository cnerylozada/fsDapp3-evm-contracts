import { network } from "hardhat";
import ProxyManagerModule from "../../ignition/modules/uups/proxyManager.js";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("ProxyManager", async function () {
  const { networkHelpers } = await network.connect();

  async function deployCounterModuleFixture() {
    const { ignition } = await network.connect();
    const { proxyContract, proxyBoxV1Contract } = await ignition.deploy(
      ProxyManagerModule
    );

    return { proxyContract, proxyBoxV1Contract };
  }

  describe("...", () => {
    it("...", async function () {
      const { proxyBoxV1Contract } = await networkHelpers.loadFixture(
        deployCounterModuleFixture
      );

      assert.equal(
        "0xDE645d7DC8f33DbC92dd970d408A9f9cF50eCD1B",
        await proxyBoxV1Contract.read.owner()
      );
      assert.equal(
        BigInt(1993),
        await proxyBoxV1Contract.read.getMagicNumber()
      );
    });
  });
});
