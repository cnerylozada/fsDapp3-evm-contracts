import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress, parseEther } from "viem";
import { generateTree, getMerkleClaimData } from "../../scripts/merkle.js";
import MerkleAirdropMinterModule from "../../ignition/modules/tokenDistribution/MerkleAirdropMinter.js";

describe("TokenDistribution", async () => {
  const { viem, networkHelpers, ignition } = await network.connect();

  async function deployMerkleAirdropMinterFixture() {
    const { tree } = generateTree();
    const root = tree.getHexRoot();

    const { merkleAirdropMinterContract, myTokenContract } =
      await ignition.deploy(MerkleAirdropMinterModule, {
        parameters: { TokenDistributionModule: { root } },
      });

    const [mainAccount, claimerAccount, otherAccount] =
      await viem.getWalletClients();

    return {
      merkleAirdropMinterContract,
      myTokenContract,
      mainAccount,
      claimerAccount,
      otherAccount,
    };
  }

  describe("deployment", () => {
    it("should set a default amount of tokens", async () => {
      const { merkleAirdropMinterContract, mainAccount } =
        await networkHelpers.loadFixture(deployMerkleAirdropMinterFixture);

      assert.equal(
        await merkleAirdropMinterContract.read.owner(),
        getAddress(mainAccount.account.address)
      );

      assert.equal(
        await merkleAirdropMinterContract.read.getTokenBalance(),
        parseEther("200000")
      );
    });
  });

  describe("isInWhiteList", async () => {
    it("should find it user is in white-list", async () => {
      const { merkleAirdropMinterContract, mainAccount, otherAccount } =
        await networkHelpers.loadFixture(deployMerkleAirdropMinterFixture);

      const user = mainAccount.account.address;
      const { maxClaimableAmount, proof } = getMerkleClaimData(
        mainAccount.account.address
      );
      assert.equal(
        await merkleAirdropMinterContract.read.isInWhiteList([
          user,
          maxClaimableAmount,
          proof,
        ]),
        true
      );

      const invalidUser = otherAccount.account.address;
      const {
        maxClaimableAmount: maxClaimableAmountOfInvalidUser,
        proof: proofOfInvalidUser,
      } = getMerkleClaimData(invalidUser);
      assert.equal(
        await merkleAirdropMinterContract.read.isInWhiteList([
          invalidUser,
          maxClaimableAmountOfInvalidUser,
          proofOfInvalidUser,
        ]),
        false
      );
    });
  });

  describe("claimTokens", async () => {
    it("should fail if it invalid params are passed", async () => {
      const { merkleAirdropMinterContract, mainAccount, otherAccount } =
        await networkHelpers.loadFixture(deployMerkleAirdropMinterFixture);

      const { proof: proofOfInvalidUser } = getMerkleClaimData(
        otherAccount.account.address
      );
      const merkleAirdropMinterContractAsOtherAccount =
        await viem.getContractAt(
          "MerkleAirdropMinter",
          merkleAirdropMinterContract.address,
          { client: { wallet: otherAccount } }
        );
      await viem.assertions.revertWithCustomError(
        merkleAirdropMinterContractAsOtherAccount.write.claimTokens([
          BigInt(1),
          BigInt(10),
          proofOfInvalidUser,
        ]),
        merkleAirdropMinterContractAsOtherAccount,
        "MerkleAirdropMinter__InvalidClaim"
      );

      const { proof, maxClaimableAmount } = getMerkleClaimData(
        mainAccount.account.address
      );
      await viem.assertions.revertWithCustomError(
        merkleAirdropMinterContract.write.claimTokens([
          maxClaimableAmount + BigInt(1),
          maxClaimableAmount,
          proof,
        ]),
        merkleAirdropMinterContract,
        "MerkleAirdropMinter__InvalidClaim"
      );
    });

    it("should track valid claims", async () => {
      const { merkleAirdropMinterContract, mainAccount } =
        await networkHelpers.loadFixture(deployMerkleAirdropMinterFixture);

      const user = mainAccount.account.address;
      const { proof, maxClaimableAmount } = getMerkleClaimData(user);
      const claimAmount = parseEther("165404.11"); // MAX: 165404.120988873

      const hash = await merkleAirdropMinterContract.write.claimTokens([
        claimAmount,
        maxClaimableAmount,
        proof,
      ]);

      const publicClient = await viem.getPublicClient();
      await publicClient.waitForTransactionReceipt({ hash });
      const claimTokensEvents =
        await merkleAirdropMinterContract.getEvents.ClaimTokens();
      assert.equal(claimTokensEvents.length, 1);
      assert.equal(claimTokensEvents[0].args.amount, claimAmount);

      assert.equal(
        await merkleAirdropMinterContract.read.getClaimedByUser([user]),
        claimAmount
      );

      await viem.assertions.revertWithCustomError(
        merkleAirdropMinterContract.write.claimTokens([
          parseEther(`1`),
          maxClaimableAmount,
          proof,
        ]),
        merkleAirdropMinterContract,
        "MerkleAirdropMinter__InvalidClaim"
      );
    });

    it("should fail if contract run out of tokens to transfer", async () => {
      const {
        mainAccount,
        claimerAccount,
        merkleAirdropMinterContract,
        myTokenContract,
      } = await networkHelpers.loadFixture(deployMerkleAirdropMinterFixture);

      const _ = getMerkleClaimData(mainAccount.account.address);
      await merkleAirdropMinterContract.write.claimTokens([
        parseEther("100000"),
        _.maxClaimableAmount,
        _.proof,
      ]);

      const merkleAirdropMinterContractAsClaimerAccount =
        await viem.getContractAt(
          "MerkleAirdropMinter",
          merkleAirdropMinterContract.address,
          { client: { wallet: claimerAccount } }
        );
      const { maxClaimableAmount, proof } = getMerkleClaimData(
        claimerAccount.account.address
      );

      await viem.assertions.revertWithCustomError(
        merkleAirdropMinterContractAsClaimerAccount.write.claimTokens([
          parseEther("120000"),
          maxClaimableAmount,
          proof,
        ]),
        myTokenContract,
        "ERC20InsufficientBalance"
      );
    });
  });

  describe("withdrawTokens", () => {
    it("should transfer tokens when owner triggers it", async () => {
      const {
        mainAccount,
        otherAccount,
        merkleAirdropMinterContract,
        myTokenContract,
      } = await networkHelpers.loadFixture(deployMerkleAirdropMinterFixture);

      const merkleAirdropMinterContractAsOtherAccount =
        await viem.getContractAt(
          "MerkleAirdropMinter",
          merkleAirdropMinterContract.address,
          { client: { wallet: otherAccount } }
        );
      await viem.assertions.revertWithCustomError(
        merkleAirdropMinterContractAsOtherAccount.write.withdrawTokens([
          otherAccount.account.address,
          parseEther("1"),
        ]),
        merkleAirdropMinterContractAsOtherAccount,
        "OwnableUnauthorizedAccount"
      );

      const owner = mainAccount.account.address;
      const amountToWithdraw = parseEther("1");
      const initialBalance = await myTokenContract.read.balanceOf([owner]);
      await merkleAirdropMinterContract.write.withdrawTokens([
        owner,
        amountToWithdraw,
      ]);

      const finalBalance = await myTokenContract.read.balanceOf([owner]);
      assert.equal(finalBalance - initialBalance, amountToWithdraw);
    });
  });
});
