import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { Hex, keccak256 } from "viem";
import { generateTree } from "../scripts/merkle.js";
import TokenDistributionModule from "../ignition/modules/TokenDistribution.js";

describe("TokenDistribution", async () => {
  const { viem, networkHelpers, ignition } = await network.connect();

  async function deployTokenDistributionFixture() {
    const tree = generateTree();
    const root = tree.getHexRoot();

    const { tokenDistributionContract } = await ignition.deploy(
      TokenDistributionModule,
      {
        parameters: { TokenDistributionModule: { root } },
      }
    );

    const [mainAccount] = await viem.getWalletClients();

    return { tokenDistributionContract, mainAccount, tree, root };
  }

  describe("verify", async () => {
    it("should find it user is in white-list", async () => {
      const { tokenDistributionContract, tree, mainAccount } =
        await networkHelpers.loadFixture(deployTokenDistributionFixture);

      const user = "0x7655dffcf59fae85b988a7c037dfa5d7ddc4c3a6";
      const proof = tree.getHexProof(keccak256(user)) as Hex[];
      assert.equal(
        await tokenDistributionContract.read.verify([user, proof]),
        true
      );

      const invalidUser = mainAccount.account.address;
      const proofOfInvalidUser = tree.getHexProof(
        keccak256(invalidUser)
      ) as Hex[];
      assert.equal(
        await tokenDistributionContract.read.verify([
          invalidUser,
          proofOfInvalidUser,
        ]),
        false
      );
    });
  });
});
