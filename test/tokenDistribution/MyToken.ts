import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import MyTokenModule from "../../ignition/modules/tokenDistribution/MyToken.js";
import { parseEther } from "viem";

describe("MyToken", async () => {
  const { ignition, viem, networkHelpers } = await network.connect();

  async function deployMyTokenFixture() {
    const [adminAccount, minterAccount, otherAccount] =
      await viem.getWalletClients();
    const { myTokenContract } = await ignition.deploy(MyTokenModule);

    const MINTER_ROLE = await myTokenContract.read.MINTER_ROLE();

    return {
      myTokenContract,
      MINTER_ROLE,
      adminAccount,
      minterAccount,
      otherAccount,
    };
  }
  describe("deployment", async () => {
    it("should set default settings", async () => {
      const { myTokenContract, adminAccount, minterAccount, MINTER_ROLE } =
        await networkHelpers.loadFixture(deployMyTokenFixture);

      assert.equal(
        await myTokenContract.read.balanceOf([adminAccount.account.address]),
        parseEther("200000")
      );

      const DEFAULT_ADMIN_ROLE =
        await myTokenContract.read.DEFAULT_ADMIN_ROLE();
      assert.equal(
        await myTokenContract.read.hasRole([
          DEFAULT_ADMIN_ROLE,
          adminAccount.account.address,
        ]),
        true
      );

      assert.equal(
        await myTokenContract.read.hasRole([
          MINTER_ROLE,
          minterAccount.account.address,
        ]),
        true
      );
    });
  });

  describe("managing roles", async () => {
    it("should grant role only if it is performed by admins", async () => {
      const { myTokenContract, minterAccount, otherAccount, MINTER_ROLE } =
        await networkHelpers.loadFixture(deployMyTokenFixture);

      const myTokenContractAsMinterAccount = await viem.getContractAt(
        "MyToken",
        myTokenContract.address,
        {
          client: { wallet: minterAccount },
        }
      );
      await viem.assertions.revertWithCustomError(
        myTokenContractAsMinterAccount.write.grantRole([
          MINTER_ROLE,
          otherAccount.account.address,
        ]),
        myTokenContractAsMinterAccount,
        "AccessControlUnauthorizedAccount"
      );

      await myTokenContract.write.grantRole([
        MINTER_ROLE,
        otherAccount.account.address,
      ]);
      assert.equal(
        await myTokenContract.read.hasRole([
          MINTER_ROLE,
          otherAccount.account.address,
        ]),
        true
      );
      assert.equal(
        await myTokenContract.read.hasRole([
          MINTER_ROLE,
          minterAccount.account.address,
        ]),
        true
      );
    });

    it("should ...", async () => {
      const { myTokenContract, otherAccount, MINTER_ROLE } =
        await networkHelpers.loadFixture(deployMyTokenFixture);

      await myTokenContract.write.grantRole([
        MINTER_ROLE,
        otherAccount.account.address,
      ]);

      const myTokenContractAsOtherAccount = await viem.getContractAt(
        "MyToken",
        myTokenContract.address,
        { client: { wallet: otherAccount } }
      );
      await myTokenContractAsOtherAccount.write.renounceRole([
        MINTER_ROLE,
        otherAccount.account.address,
      ]);
      assert.equal(
        await myTokenContract.read.hasRole([
          MINTER_ROLE,
          otherAccount.account.address,
        ]),
        false
      );
    });
  });
});
