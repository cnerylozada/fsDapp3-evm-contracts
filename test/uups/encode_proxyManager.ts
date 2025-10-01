import { network } from "hardhat";
import EncodeProxyManagerModule from "../../ignition/modules/uups/encode_proxyManager.js";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("ProxyManager", async function () {
  const { networkHelpers } = await network.connect();

  async function deployCounterModuleFixture() {
    const { ignition } = await network.connect();
    const { proxyContract, proxyBoxV1Contract } = await ignition.deploy(
      EncodeProxyManagerModule
    );
    return { proxyContract, proxyBoxV1Contract };
  }

  describe("deployment impl BoxV1", () => {
    it("should initialize params", async function () {
      const { proxyContract, proxyBoxV1Contract } =
        await networkHelpers.loadFixture(deployCounterModuleFixture);
      assert.equal(proxyContract.address, proxyBoxV1Contract.address);

      const magicNumber = BigInt(1993);
      const owner = "0xDE645d7DC8f33DbC92dd970d408A9f9cF50eCD1B";
      assert.equal(owner, await proxyBoxV1Contract.read.owner());
      assert.equal(magicNumber, await proxyBoxV1Contract.read.getMagicNumber());
    });
  });
});
