import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress, parseEther } from "viem";
import { getMerkleClaimData } from "../../scripts/merkle.js";
import MerkleAirdropMinterModule from "../../ignition/modules/tokenDistribution/MerkleAirdropMinter.js";

describe("TokenDistribution", async () => {
  const { viem, networkHelpers, ignition, networkConfig } =
    await network.connect();

  async function createSignature(
    verifyingContract: `0x${string}`,
    account: `0x${string}`,
    amount: bigint,
  ) {
    const domain = {
      chainId: networkConfig.chainId,
      verifyingContract,
      name: "MerkleAirdropMinter",
      version: "1.0.0",
    };
    const types = {
      AirdropClaim: [
        { name: "account", type: "address" },
        { name: "amount", type: "uint256" },
      ],
    };
    const value = {
      account,
      amount,
    };

    const [mainAccount, beneficiaryAccount, otherAccount] =
      await viem.getWalletClients();
    const signatures = await Promise.all([
      mainAccount.signTypedData({
        domain,
        types,
        message: value,
        primaryType: "AirdropClaim",
      }),
      beneficiaryAccount.signTypedData({
        domain,
        types,
        message: value,
        primaryType: "AirdropClaim",
      }),
      otherAccount.signTypedData({
        domain,
        types,
        message: value,
        primaryType: "AirdropClaim",
      }),
    ]);

    return signatures;
  }

  async function deployMerkleAirdropMinterFixture() {
    const { merkleAirdropMinterContract, myTokenContract } =
      await ignition.deploy(MerkleAirdropMinterModule);

    const [mainAccount, beneficiaryAccount, otherAccount] =
      await viem.getWalletClients();

    return {
      merkleAirdropMinterContract,
      myTokenContract,
      mainAccount,
      beneficiaryAccount,
      otherAccount,
    };
  }

  describe("deployment", () => {
    it("should set a default amount of tokens", async () => {
      const { merkleAirdropMinterContract, mainAccount } =
        await networkHelpers.loadFixture(deployMerkleAirdropMinterFixture);

      assert.equal(
        await merkleAirdropMinterContract.read.owner(),
        getAddress(mainAccount.account.address),
      );

      assert.equal(
        await merkleAirdropMinterContract.read.getTokenBalance(),
        parseEther("200000"),
      );
    });
  });

  describe("isInWhiteList", async () => {
    it("should find it user is in white-list", async () => {
      const { merkleAirdropMinterContract, mainAccount, otherAccount } =
        await networkHelpers.loadFixture(deployMerkleAirdropMinterFixture);

      const user = mainAccount.account.address;
      const { maxClaimableAmount, proof } = getMerkleClaimData(
        mainAccount.account.address,
      );
      assert.equal(
        await merkleAirdropMinterContract.read.isInWhiteList([
          user,
          maxClaimableAmount,
          proof,
        ]),
        true,
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
        false,
      );
    });
  });

  describe("claimTokens", async () => {
    it("should fail if invalid params are passed", async () => {
      const { merkleAirdropMinterContract, mainAccount, otherAccount } =
        await networkHelpers.loadFixture(deployMerkleAirdropMinterFixture);

      const merkleAirdropMinterContractAsOtherAccount =
        await viem.getContractAt(
          "MerkleAirdropMinter",
          merkleAirdropMinterContract.address,
          { client: { wallet: otherAccount } },
        );
      const signer = otherAccount.account.address;
      const { proof: proofOfInvalidUser } = getMerkleClaimData(signer);
      const [, , otherAccountSignature] = await createSignature(
        merkleAirdropMinterContract.address,
        signer,
        parseEther("1"),
      );
      await viem.assertions.revertWithCustomError(
        merkleAirdropMinterContractAsOtherAccount.write.claimTokens([
          signer,
          parseEther("1"),
          BigInt(10),
          proofOfInvalidUser,
          otherAccountSignature,
        ]),
        merkleAirdropMinterContractAsOtherAccount,
        "MerkleAirdropMinter__NotInWhiteList",
      );

      const beneficiary = mainAccount.account.address;
      const { proof, maxClaimableAmount } = getMerkleClaimData(beneficiary);
      const [mainAccountSignature, ,] = await createSignature(
        merkleAirdropMinterContract.address,
        beneficiary,
        maxClaimableAmount,
      );
      await viem.assertions.revertWithCustomError(
        merkleAirdropMinterContract.write.claimTokens([
          beneficiary,
          maxClaimableAmount + BigInt(1),
          maxClaimableAmount,
          proof,
          mainAccountSignature,
        ]),
        merkleAirdropMinterContract,
        "MerkleAirdropMinter__InvalidAmountToClaim",
      );
    });

    it("should track valid claims", async () => {
      const {
        merkleAirdropMinterContract,
        beneficiaryAccount,
        myTokenContract,
      } = await networkHelpers.loadFixture(deployMerkleAirdropMinterFixture);

      const beneficiaryData = {
        account: beneficiaryAccount.account.address,
        amount: parseEther("134708.11"), // MAX: 134708.55023119
      };
      const { proof, maxClaimableAmount } = getMerkleClaimData(
        beneficiaryData.account,
      );
      const [, signature, _] = await createSignature(
        merkleAirdropMinterContract.address,
        beneficiaryData.account,
        beneficiaryData.amount,
      );
      const hash = await merkleAirdropMinterContract.write.claimTokens([
        beneficiaryData.account,
        beneficiaryData.amount,
        maxClaimableAmount,
        proof,
        signature,
      ]);

      const publicClient = await viem.getPublicClient();
      await publicClient.waitForTransactionReceipt({ hash });
      const claimTokensEvents =
        await merkleAirdropMinterContract.getEvents.ClaimTokens();

      assert.equal(claimTokensEvents.length, 1);
      assert.equal(claimTokensEvents[0].args.amount, beneficiaryData.amount);
      assert.equal(
        await merkleAirdropMinterContract.read.getClaimedByUser([
          beneficiaryData.account,
        ]),
        beneficiaryData.amount,
      );

      assert.equal(
        await myTokenContract.read.balanceOf([beneficiaryData.account]),
        beneficiaryData.amount,
      );
    });

    it("should fail if contract run out of tokens to transfer", async () => {
      const {
        mainAccount,
        beneficiaryAccount,
        merkleAirdropMinterContract,
        myTokenContract,
      } = await networkHelpers.loadFixture(deployMerkleAirdropMinterFixture);

      const _ = getMerkleClaimData(mainAccount.account.address);
      // await merkleAirdropMinterContract.write.claimTokens([
      //   parseEther("100000"),
      //   _.maxClaimableAmount,
      //   _.proof,
      // ]);
      // const merkleAirdropMinterContractAsClaimerAccount =
      //   await viem.getContractAt(
      //     "MerkleAirdropMinter",
      //     merkleAirdropMinterContract.address,
      //     { client: { wallet: claimerAccount } },
      //   );
      //     const { maxClaimableAmount, proof } = getMerkleClaimData(
      //       claimerAccount.account.address
      //     );
      //     await viem.assertions.revertWithCustomError(
      //       merkleAirdropMinterContractAsClaimerAccount.write.claimTokens([
      //         parseEther("120000"),
      //         maxClaimableAmount,
      //         proof,
      //       ]),
      //       myTokenContract,
      //       "ERC20InsufficientBalance"
      //     );
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
          { client: { wallet: otherAccount } },
        );
      await viem.assertions.revertWithCustomError(
        merkleAirdropMinterContractAsOtherAccount.write.withdrawTokens([
          otherAccount.account.address,
          parseEther("1"),
        ]),
        merkleAirdropMinterContractAsOtherAccount,
        "OwnableUnauthorizedAccount",
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
