import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { Hex, keccak256, parseEther } from "viem";
import { CLAIM_ALLOWANCES, generateTree } from "../scripts/merkle.js";
import TokenDistributionModule from "../ignition/modules/TokenDistribution.js";

describe("TokenDistribution", async () => {
  const { viem, networkHelpers, ignition } = await network.connect();

  async function deployTokenDistributionFixture() {
    const { tree } = generateTree(CLAIM_ALLOWANCES);
    const root = tree.getHexRoot();

    const { tokenDistributionContract } = await ignition.deploy(
      TokenDistributionModule,
      {
        parameters: { TokenDistributionModule: { root } },
      }
    );

    const [mainAccount, otherAccount] = await viem.getWalletClients();

    return {
      tokenDistributionContract,
      mainAccount,
      otherAccount,
      tree,
    };
  }

  describe("isInWhiteList", async () => {
    it("should find it user is in white-list", async () => {
      const { tokenDistributionContract, tree, mainAccount, otherAccount } =
        await networkHelpers.loadFixture(deployTokenDistributionFixture);

      const user = mainAccount.account.address;
      const proof = tree.getHexProof(keccak256(user)) as Hex[];
      assert.equal(
        await tokenDistributionContract.read.isInWhiteList([user, proof]),
        true
      );

      const invalidUser = otherAccount.account.address;
      const proofOfInvalidUser = tree.getHexProof(
        keccak256(invalidUser)
      ) as Hex[];
      assert.equal(
        await tokenDistributionContract.read.isInWhiteList([
          invalidUser,
          proofOfInvalidUser,
        ]),
        false
      );
    });
  });

  describe("claimTokens", async () => {
    it("should fail if it invalid params are passed", async () => {
      const { tokenDistributionContract, tree, mainAccount, otherAccount } =
        await networkHelpers.loadFixture(deployTokenDistributionFixture);

      const invalidUser = otherAccount.account.address;
      const proofOfInvalidUser = tree.getHexProof(
        keccak256(invalidUser)
      ) as Hex[];
      await viem.assertions.revertWithCustomError(
        tokenDistributionContract.write.claimTokens([
          BigInt(1),
          BigInt(10),
          proofOfInvalidUser,
        ]),
        tokenDistributionContract,
        "TokenDistribution__InvalidClaim"
      );

      const user = mainAccount.account.address;
      const proof = tree.getHexProof(keccak256(user)) as Hex[];
      const { amount } = CLAIM_ALLOWANCES.filter((_) => _.address === user)[0];
      const maxClaimableAmount = parseEther(amount.toString());

      await viem.assertions.revertWithCustomError(
        tokenDistributionContract.write.claimTokens([
          maxClaimableAmount + BigInt(1),
          maxClaimableAmount,
          proof,
        ]),
        tokenDistributionContract,
        "TokenDistribution__InvalidClaim"
      );
    });

    it("should track valid claims", async () => {
      const { tokenDistributionContract, tree, mainAccount } =
        await networkHelpers.loadFixture(deployTokenDistributionFixture);

      const user = mainAccount.account.address;
      const proof = tree.getHexProof(keccak256(user)) as Hex[];
      const { amount } = CLAIM_ALLOWANCES.filter((_) => _.address === user)[0];
      const maxClaimableAmount = parseEther(amount.toString());

      const claimAmount = parseEther("165404.11"); // MAX: 165404.120988873
      await tokenDistributionContract.write.claimTokens([
        claimAmount,
        maxClaimableAmount,
        proof,
      ]);
      assert.equal(
        await tokenDistributionContract.read.getClaimedByUser([user]),
        claimAmount
      );

      await viem.assertions.revertWithCustomError(
        tokenDistributionContract.write.claimTokens([
          parseEther(`1`),
          maxClaimableAmount,
          proof,
        ]),
        tokenDistributionContract,
        "TokenDistribution__InvalidClaim"
      );
    });
  });
});
