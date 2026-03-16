import { MerkleTree } from "merkletreejs";
import {
  encodeAbiParameters,
  Hex,
  keccak256,
  parseEther,
  parseUnits,
} from "viem";

export const CLAIM_ALLOWANCES = [
  {
    address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    amount: 165404.120988873,
  },
  {
    address: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    amount: 134708.55023119,
  },
  {
    address: "0xDE645d7DC8f33DbC92dd970d408A9f9cF50eCD1B",
    amount: 11.161260967,
  },
  {
    address: "0x58Dc4256E7E5402cc1A88d9A63c640B1A3959722",
    amount: 3.657841091,
  },
  {
    address: "0x861ba63eB1564113793a62550CC5095e137b10c2",
    amount: 46962.2054604551,
  },
  {
    address: "0x7090aa5141bfc8c1a91106b7b8137a8eabf5e821",
    amount: 28260.6793403811,
  },
  {
    address: "0xaFCeC3b52F31f8418325Dac57810CDc9B1a448EA",
    amount: 23499.1910459254,
  },
];

export const generateTree = () => {
  const leaves = CLAIM_ALLOWANCES.map((_) => {
    const amount = parseUnits(_.amount.toString(), 18);
    const encodeItem = encodeAbiParameters(
      [
        { name: "wallet", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      [_.address as `0x${string}`, amount],
    );
    return keccak256(encodeItem);
  });
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  return { tree };
};

export const getMerkleClaimData = (wallet: `0x${string}`) => {
  const { tree } = generateTree();

  const allowance = CLAIM_ALLOWANCES.find((_) => _.address === wallet);
  const maxClaimableAmount = parseEther(
    (allowance ? allowance.amount : 0).toString(),
  );

  const hash = keccak256(
    encodeAbiParameters(
      [
        { name: "wallet", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      [wallet, maxClaimableAmount],
    ),
  );

  return { maxClaimableAmount, proof: tree.getHexProof(hash) as Hex[] };
};
