import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import PanagramModule from "../../ignition/modules/panagram/Panagram.js";
import { claimByMainUser } from "./utils.js";

const { viem, ignition } = await network.connect();

describe("Panagram", async function () {
  const { networkHelpers } = await network.connect();

  async function deployPanagramModuleFixture() {
    const [adminUser, mainUser, otherUser] = await viem.getWalletClients();

    const {
      mockVerifierContract,
      panagramAccessManagerContract,
      panagramContract,
    } = await ignition.deploy(PanagramModule);

    return {
      adminUser,
      mainUser,
      otherUser,
      mockVerifierContract,
      panagramAccessManagerContract,
      panagramContract,
    };
  }

  it("should set default settings", async function () {
    const { panagramAccessManagerContract, panagramContract } =
      await networkHelpers.loadFixture(deployPanagramModuleFixture);

    assert.equal(
      panagramAccessManagerContract.address,
      await panagramContract.read.authority(),
    );
  });

  it("should ...", async function () {
    const { mainUser, panagramContract, otherUser } =
      await networkHelpers.loadFixture(deployPanagramModuleFixture);

    const panagramContractAsMainUser = await viem.getContractAt(
      "Panagram",
      panagramContract.address,
      { client: { wallet: mainUser } },
    );

    const claimRewardTx = await panagramContractAsMainUser.write.claimReward([
      claimByMainUser.proof,
      claimByMainUser.publicInputs,
    ]);
  });
});
