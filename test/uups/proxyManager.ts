import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress, zeroAddress } from "viem";
import { deployProxyManagerModuleFixture } from "./utils.js";

describe("ProxyManager", async function () {
  const { networkHelpers, viem } = await network.connect();

  describe("deployment impl BoxV1", () => {
    it("should initialize params", async function () {
      const { proxyContract, proxyBoxV1Contract, mainUser } =
        await networkHelpers.loadFixture(deployProxyManagerModuleFixture);

      assert.equal(proxyContract.address, proxyBoxV1Contract.address);
      assert.equal(
        await proxyBoxV1Contract.read.owner(),
        getAddress(mainUser.account.address)
      );

      const magicNumber = BigInt(9);
      assert.equal(magicNumber, await proxyBoxV1Contract.read.getMagicNumber());
    });

    it("should should prevent re-initialization and block upgrades from non-owners", async () => {
      const { boxV1Contract, proxyBoxV1Contract, otherAccount } =
        await networkHelpers.loadFixture(deployProxyManagerModuleFixture);

      await viem.assertions.revertWithCustomError(
        proxyBoxV1Contract.write.initialize([zeroAddress, BigInt(1)]),
        proxyBoxV1Contract,
        "InvalidInitialization"
      );

      const proxyBoxV1ContractAsOtherAccount = await viem.getContractAt(
        "BoxV1",
        proxyBoxV1Contract.address,
        { client: { wallet: otherAccount } }
      );
      await viem.assertions.revertWithCustomError(
        proxyBoxV1ContractAsOtherAccount.write.upgradeToAndCall([
          boxV1Contract.address,
          "0x",
        ]),
        proxyBoxV1ContractAsOtherAccount,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("setMagicNumber", () => {
    it("should set a new magicNumber", async () => {
      const { proxyBoxV1Contract, boxV1Contract } =
        await networkHelpers.loadFixture(deployProxyManagerModuleFixture);

      const magicNumber = BigInt(2025);
      await proxyBoxV1Contract.write.setMagicNumber([magicNumber]);
      assert.equal(magicNumber, await proxyBoxV1Contract.read.getMagicNumber());

      assert.equal(await boxV1Contract.read.owner(), zeroAddress);
      assert.equal(await boxV1Contract.read.getMagicNumber(), BigInt(0));
    });
  });
});
