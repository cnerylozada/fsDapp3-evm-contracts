import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import ManagerTokenModule from "../../ignition/modules/accessManager/ManagerToken.js";
import { parseEther, toFunctionSelector } from "viem";

const { viem, ignition } = await network.connect();

const ADMIN_ROLE = BigInt(0);
const MINTER_ROLE = BigInt(1);

export async function deployManagerTokenModuleFixture() {
  const [mainUser, minterUser, otherUser] = await viem.getWalletClients();

  const { accessManagerWrapperContract, managerTokenContract } =
    await ignition.deploy(ManagerTokenModule);

  return {
    mainUser,
    minterUser,
    otherUser,
    accessManagerWrapperContract,
    managerTokenContract,
  };
}

describe("ManagerToken", async () => {
  const { networkHelpers } = await network.connect();

  describe("AccessManager", () => {
    it("should grant MINTER_ROLE to minterAccount and authorize it to call mint", async () => {
      const { accessManagerWrapperContract, managerTokenContract, minterUser } =
        await networkHelpers.loadFixture(deployManagerTokenModuleFixture);

      const [isMember] = await accessManagerWrapperContract.read.hasRole([
        MINTER_ROLE,
        minterUser.account.address,
      ]);
      assert.equal(true, isMember);

      const [immediate] = await accessManagerWrapperContract.read.canCall([
        minterUser.account.address,
        managerTokenContract.address,
        toFunctionSelector("mint(address,uint256)"),
      ]);
      assert.equal(true, immediate);
    });

    it("should allow minterAccount to mint", async () => {
      const { managerTokenContract, minterUser } =
        await networkHelpers.loadFixture(deployManagerTokenModuleFixture);

      const managerTokenContractAsMinterUser = await viem.getContractAt(
        "ManagerToken",
        managerTokenContract.address,
        { client: { wallet: minterUser } },
      );

      await managerTokenContractAsMinterUser.write.mint([
        minterUser.account.address,
        parseEther("1"),
      ]);
      assert.equal(
        parseEther("1"),
        await managerTokenContract.read.balanceOf([minterUser.account.address]),
      );
    });

    it("should reject mint from an unauthorized account, then allow it after granting MINTER_ROLE", async () => {
      const {
        accessManagerWrapperContract,
        managerTokenContract,
        minterUser,
        otherUser,
      } = await networkHelpers.loadFixture(deployManagerTokenModuleFixture);

      const managerTokenContractAsOtherUser = await viem.getContractAt(
        "ManagerToken",
        managerTokenContract.address,
        { client: { wallet: otherUser } },
      );
      await viem.assertions.revertWithCustomError(
        managerTokenContractAsOtherUser.write.mint([
          otherUser.account.address,
          parseEther("1"),
        ]),
        managerTokenContractAsOtherUser,
        "AccessManagedUnauthorized",
      );

      await accessManagerWrapperContract.write.grantRole([
        MINTER_ROLE,
        otherUser.account.address,
        0,
      ]);

      const [immediate] = await accessManagerWrapperContract.read.canCall([
        otherUser.account.address,
        managerTokenContract.address,
        toFunctionSelector("mint(address,uint256)"),
      ]);
      assert.equal(true, immediate);

      const [isMember] = await accessManagerWrapperContract.read.hasRole([
        MINTER_ROLE,
        minterUser.account.address,
      ]);
      assert.equal(true, isMember);
    });

    it("should transfer admin role from mainUser to minterUser while preserving minterUser's MINTER_ROLE", async () => {
      const { mainUser, minterUser, accessManagerWrapperContract } =
        await networkHelpers.loadFixture(deployManagerTokenModuleFixture);

      await accessManagerWrapperContract.write.grantRole([
        ADMIN_ROLE,
        minterUser.account.address,
        0,
      ]);
      await accessManagerWrapperContract.write.revokeRole([
        ADMIN_ROLE,
        mainUser.account.address,
      ]);

      const [isMainUserMember] =
        await accessManagerWrapperContract.read.hasRole([
          ADMIN_ROLE,
          mainUser.account.address,
        ]);
      assert.equal(false, isMainUserMember);

      const [isMinterUserAdmin] =
        await accessManagerWrapperContract.read.hasRole([
          ADMIN_ROLE,
          minterUser.account.address,
        ]);
      assert.equal(true, isMinterUserAdmin);
      const [isMinterUserMinter] =
        await accessManagerWrapperContract.read.hasRole([
          MINTER_ROLE,
          minterUser.account.address,
        ]);
      assert.equal(true, isMinterUserMinter);
    });
  });
});
