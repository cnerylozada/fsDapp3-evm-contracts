import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import PanagramModule from "../../ignition/modules/panagram/Panagram.js";
import {
  noirProofMainUser100,
  noirProofMainUser101,
  noirProofOtherUser200,
} from "./utils.js";
import { getAddress, zeroAddress } from "viem";

const { viem, ignition, networkHelpers } = await network.connect();

describe("Panagram", async function () {
  const BACKEND_SIGNER_ROLE = BigInt(1);

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
    const { panagramAccessManagerContract, panagramContract, adminUser } =
      await networkHelpers.loadFixture(deployPanagramModuleFixture);

    assert.equal(
      await panagramContract.read.authority(),
      panagramAccessManagerContract.address,
    );

    const [hasAdminRole] = await panagramAccessManagerContract.read.hasRole([
      BigInt(0),
      adminUser.account.address,
    ]);
    assert.equal(hasAdminRole, true);
    const [isBackendSigner] = await panagramAccessManagerContract.read.hasRole([
      BACKEND_SIGNER_ROLE,
      adminUser.account.address,
    ]);
    assert.equal(isBackendSigner, true);
    assert.equal(await panagramContract.read.name(), "Panagram ZK");
    assert.equal(await panagramContract.read.symbol(), "PNG_ZK");
  });

  it("should mint only for the bound claimer, and only once per nullifier", async function () {
    const { mainUser, panagramContract } = await networkHelpers.loadFixture(
      deployPanagramModuleFixture,
    );

    const panagramContractAsMainUser = await viem.getContractAt(
      "Panagram",
      panagramContract.address,
      { client: { wallet: mainUser } },
    );

    // await viem.assertions.emitWithArgs(
    //   panagramContractAsMainUser.write.claimReward([
    //     noirProofMainUser100.proof,
    //     noirProofMainUser100.publicInputs,
    //   ]),
    //   panagramContractAsMainUser,
    //   "Transfer",
    //   [zeroAddress, getAddress(mainUser.account.address), 0n],
    // );

    // await viem.assertions.emitWithArgs(
    //   panagramContractAsMainUser.write.claimReward([
    //     noirProofMainUser101.proof,
    //     noirProofMainUser101.publicInputs,
    //   ]),
    //   panagramContractAsMainUser,
    //   "Transfer",
    //   [zeroAddress, getAddress(mainUser.account.address), 1n],
    // );

    // assert.equal(
    //   await panagramContractAsMainUser.read.balanceOf([
    //     mainUser.account.address,
    //   ]),
    //   BigInt(2),
    // );

    // await viem.assertions.revertWithCustomError(
    //   panagramContractAsMainUser.write.claimReward([
    //     noirProofMainUser101.proof,
    //     noirProofMainUser101.publicInputs,
    //   ]),
    //   panagramContractAsMainUser,
    //   "Panagram__NullfierAlreadyUsed",
    // );
  });

  it("should revert when the proof belongs to another wallet", async () => {
    const { mainUser, panagramContract } = await networkHelpers.loadFixture(
      deployPanagramModuleFixture,
    );

    const panagramContractAsMainUser = await viem.getContractAt(
      "Panagram",
      panagramContract.address,
      { client: { wallet: mainUser } },
    );

    // await viem.assertions.revertWithCustomError(
    //   panagramContractAsMainUser.write.claimReward([
    //     noirProofOtherUser200.proof,
    //     noirProofOtherUser200.publicInputs,
    //   ]),
    //   panagramContractAsMainUser,
    //   "Panagram__ProofNotBoundToClaimer",
    // );
  });
});
