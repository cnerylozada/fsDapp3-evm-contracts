import { MerkleTree } from "merkletreejs";
import { Hex, keccak256 } from "viem";

export const CLAIM_ALLOWANCES = [
  {
    address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    amount: 165404.120988873,
  },
  {
    address: "0x216BACbE54eBa495688C3fdBC3Dc794DE525702b",
    amount: 134708.55023119,
  },
  {
    address: "0xDE645d7DC8f33DbC92dd970d408A9f9cF50eCD1B",
    amount: 113151.161260967,
  },
  {
    address: "0x1031cae6c23ce093decae53a0118754aab3f10fa",
    amount: 105877.657841091,
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
  {
    address: "0xbe40d897df88ae87b3b87d21756e2662625787d8",
    amount: 20367.1764394917,
  },
  {
    address: "0x79f1e4798239a5e786d207fb33d91c76c8ab44cc",
    amount: 11698.2860794724,
  },
  {
    address: "0x28f161247827368f636f46fc06c67d9400ca66ef",
    amount: 11609.3313048631,
  },
  {
    address: "0xbb153f542eb1b7be2ce1ecbc73962461168ba91a",
    amount: 7087.7728749039,
  },
  {
    address: "0xada44af8db04ca4013cd0a0648f13c3206c1854d",
    amount: 6866.04674010517,
  },
  {
    address: "0xE8fCd4CD3551BE6963A24Ae5c6cc50825Ec65629 ",
    amount: 5100.84618829047,
  },
  {
    address: "0x9F91CF68B8dCb20d463562b74B24EE7A5D758C7e",
    amount: 4774.9668392194,
  },
  {
    address: "0x297cA46622A868fABe309Bf1b9ae2f61CA08A919",
    amount: 4752.33664317552,
  },
  {
    address: "0xe2e7414744b031dd50781313f7f631e747872125",
    amount: 4431.03764578372,
  },
  {
    address: "0x63Ab78e58AaF843D4CDD3e3A8bd0671362b10375",
    amount: 4231.89192059758,
  },
  {
    address: "0x86e236fe1ce3d8750fde33af585f2a53e1815e9d",
    amount: 3792.84348715027,
  },
  {
    address: "0x637852c2d18d2c4b1e5ac1a42beada9bbfa1a3b9",
    amount: 2679.41521159535,
  },
  {
    address: "0x9D6FA54A5D0C7E6766E89a55e07CfDA0DC9A8760 ",
    amount: 1697.26470329097,
  },
  {
    address: "0x9d16112bc8cde2ae8893cd2c208289df1f6847df",
    amount: 1489.06689968728,
  },
  {
    address: "0x3b79600cff0df74bf6af36d8357d8b412f98a548",
    amount: 1425.70235076442,
  },
  {
    address: "0x41344717B5f63e7d9CA8503678c85A67c5e17399",
    amount: 1697.26470329097,
  },
  {
    address: "0xb826410a5e1832488b4b24ba716b75f5cbca9a69",
    amount: 656.27568527251,
  },
  {
    address: "0x99d16f217b34dedf6519bd4efc64251fc0f61ce1",
    amount: 647.223606854958,
  },
  {
    address: "0x1b92a14f82b0da59f3871427271753c2ab80eca4",
    amount: 574.806979514543,
  },
  {
    address: "0x7fbccbbcf623c4f3bbd4d7de0d54ade51b3df6fa",
    amount: 547.650744261888,
  },
  {
    address: "0x52457A6D17681AcE340f31Ea13d143f3B765a1cB",
    amount: 520.494509009232,
  },
  {
    address: "0x51053039acd6291146e43b8f4df22d78e6cc916a",
    amount: 497.864312965352,
  },
  {
    address: "0x2c89d2c800bd6bb09fc35023fa6a05981044e2da",
    amount: 493.338273756576,
  },
  {
    address: "0x1c4301eeb03be383234a7083db4daabde6cf9649",
    amount: 493.338273756576,
  },
  {
    address: "0x460ad79de84e0098b1a1bc039a2ee6da1a28e895",
    amount: 493.338273756576,
  },
  {
    address: "0xf94e3f756ef445668c9d096128a7f0a3f51e8372",
    amount: 493.338273756576,
  },
  {
    address: "0x2640276ff2bdd101ea898b17c01d6263344137b0",
    amount: 457.129960086369,
  },
  {
    address: "0x3194094a9eed49230eb9f3b457286b332fd11a05",
    amount: 443.551842460041,
  },
  {
    address: "0xc0932cb0c75ce776bc1fc409f582f86fc9eb8626",
    amount: 443.551842460041,
  },
  {
    address: "0xaf6a2f058eb4d25c2547f298a68031b7a711b214",
    amount: 439.025803251265,
  },
  {
    address: "0xef6dbfb522fbf94358a98b13d2d6da1b9fc64c04",
    amount: 407.343528789834,
  },
  {
    address: "0x87648da6e2a7c98469e12d759d398528661e10f2",
    amount: 398.291450372282,
  },
  {
    address: "0xd746587e9b0b92bb123de47f0a784ed098eec995",
    amount: 398.291450372282,
  },
  {
    address: "0xd77dd53f380461bc3e548111bd5d20d8a8c9777a",
    amount: 398.291450372282,
  },
  {
    address: "0xd0002538004bfbcbe409168f5aea0b165f1dca71",
    amount: 398.291450372282,
  },
  {
    address: "0x4aab868d1c58dfee3232eadb31fef2c84f5fc8f5",
    amount: 393.765411163506,
  },
  {
    address: "0x2662bd4c2f15742725357a7c26e09fd6e506540c",
    amount: 389.23937195473,
  },
  {
    address: "0xf73e357851441910d68a85ee9238c808d964a66a",
    amount: 348.505019075747,
  },
  {
    address: "0x72a41e0af50dd4b76c1b0e9570e4d36e9161ed74",
    amount: 348.505019075747,
  },
  {
    address: "0xad33a48ffc4ccf14acbcd16e2feb5179be9d4f8f",
    amount: 348.505019075747,
  },
  {
    address: "0x2626e716d0e49eb8545239bd263888b09396e7b7",
    amount: 348.505019075747,
  },
  {
    address: "0xe1b7ed9172f7c00b8c93388124b57f8d0e879dab",
    amount: 348.505019075747,
  },
  {
    address: "0x06b7ecec4586e15b1c9e2b782543d9ccd74415f8",
    amount: 348.505019075747,
  },
  {
    address: "0x3e9babafb92089764fd2fb769e29ec5075194adc",
    amount: 348.505019075747,
  },
  {
    address: "0x8c2917d18657aeb958a266783bf3dbaf93e37175",
    amount: 348.505019075747,
  },
  {
    address: "0xac4b03ae08cb9c38345f22776a7f1665af4aba2e",
    amount: 348.505019075747,
  },
  {
    address: "0x8ba10abf7ff8053f9bfe53518e01b16ed5afb171",
    amount: 348.505019075747,
  },
  {
    address: "0x8b38dae0b2c56ba6cf73f63561633ff47794f163",
    amount: 348.505019075747,
  },
  {
    address: "0x12d6248ec096fc0a9c8b0825ebd9f04bde6e0b39",
    amount: 348.505019075747,
  },
  {
    address: "0x16bee437cb63b26969fcf1d3ae4a45ab55ab29dd",
    amount: 348.505019075747,
  },
  {
    address: "0x07f6aae4f91c53b8a7caa151f3853c2588586bbe",
    amount: 298.718587779211,
  },
  {
    address: "0x1130dceb51b4c81daec93350881255531f091a8e",
    amount: 276.088391735332,
  },
  {
    address: "0x6bb17cdd2af83949a20e59d1142f24519b7193a8",
    amount: 199.145725186141,
  },
  {
    address: "0xd6c55ec8548cd550e8b51f5575c39f29e18747c1",
    amount: 199.145725186141,
  },
  {
    address: "0x12fbdbfa40d5c583151dc96d1dd3c185ab166bcd",
    amount: 199.145725186141,
  },
  {
    address: "0x46de1ECC3cD2f81e326c579F5E81103Cfda0824A",
    amount: 199.145725186141,
  },
  {
    address: "0x8bf64598d23808f2af71d5f4132062899521a26c",
    amount: 167.463450724709,
  },
  {
    address: "0xffa7046f7589c907e68e27efa4a507ead3cd7ec3",
    amount: 149.38192408565,
  },
  {
    address: "0xfccb94ab39106cf8f2a67b5f2a54f5b69e55141e",
    amount: 149.359293889606,
  },
  {
    address: "0xee9bb1cf1f9436305cf405e7787cb8b38f1cbe0d",
    amount: 149.359293889606,
  },
  {
    address: "0x17577189420f38b5ce5983874638b96f29b7cfb1",
    amount: 149.359293889606,
  },
  {
    address: "0x18bd5eae25076fb25c8556c927892cc9547bff6f",
    amount: 149.359293889606,
  },
  {
    address: "0x019a9c7bef58fb39eb167a6186659af007a60496",
    amount: 149.359293889606,
  },
  {
    address: "0x5a299d43d081cf44ecc016a518b3f354c574ef06",
    amount: 149.359293889606,
  },
  {
    address: "0x6033dae2b121f0b799bf5a8f0cff614abe806ec8",
    amount: 149.359293889606,
  },
  {
    address: "0x00d1025ed34e715cb84fd7a63c402d57ae956106",
    amount: 149.359293889606,
  },
  {
    address: "0xb258674d5c9ab97d360ed64e2802f10647deef60",
    amount: 149.359293889606,
  },
  {
    address: "0x19c3474427e8290b704e7a17e8b329cca518ed5e",
    amount: 149.359293889606,
  },
  {
    address: "0x10004676072829c5d0d3a98981cc8f09cbb5a798",
    amount: 149.359293889606,
  },
  {
    address: "0x0fedea46f37ce038f81f5b1200eaa5cd7551f00b",
    amount: 149.359293889606,
  },
  {
    address: "0x0728260600365c798efb3f3f33d05c2e7baa448c",
    amount: 149.359293889606,
  },
  {
    address: "0x0ea3d684a7d57489f6b5eac38c146bb66adbf285",
    amount: 149.359293889606,
  },
  {
    address: "0x5e5283e599f3c3ee493fea6da9808ab171d6222b",
    amount: 140.307215472054,
  },
  {
    address: "0x2d99d06bbfd11b0fcc0e8e09dd916787f2eabd79",
    amount: 113.150980219398,
  },
  {
    address: "0xd0e9fc9e2f87fd56611bf029be5c166590ba48a9",
    amount: 113.150980219398,
  },
  {
    address: "0xc83bc869fa7e1b63da27b60068f1f79563b5358e",
    amount: 108.647571206666,
  },
  {
    address: "0xa6c9694fc1d12afc373f4b7b954d2608f63ff210",
    amount: 99.5728625930705,
  },
  {
    address: "0x393935cebed3c8c1aeaeefa6a5d33f2501517a58",
    amount: 99.5728625930705,
  },
  {
    address: "0xc333853c729855c7a390aa3321dee4ead8865fdd",
    amount: 99.5728625930705,
  },
  {
    address: "0x4969b72561bf652bf6cd2f87fae034ea90d96418",
    amount: 99.5728625930705,
  },
  {
    address: "0x586b00938812a8df73ced2cd2f1d78d58ff8190a",
    amount: 99.5728625930705,
  },
  {
    address: "0xf5d86b31236f7b59b1cc213d64636149a33d8455",
    amount: 99.5728625930705,
  },
  {
    address: "0xf52603c24c45d19d4526285214c5e768d3e304ed",
    amount: 99.5728625930705,
  },
  {
    address: "0x762d8fd92dc3c89a0eebccc95c013d9b822d7463",
    amount: 99.5728625930705,
  },
  {
    address: "0xc99b93b8a974d1fee04354934d7570bc56279fe5",
    amount: 99.5728625930705,
  },
  {
    address: "0xcac1e820aa4ac7b18becaf674f04f56d50c57876",
    amount: 99.5728625930705,
  },
  {
    address: "0x24a489fabdeadcbbc2fbaad867cad57330270b6c",
    amount: 99.5728625930705,
  },
  {
    address: "0x13eb0a5b8816c05997651c1e5672d6ab2deb94cb",
    amount: 99.5728625930705,
  },
  {
    address: "0xc8e496a77a221d11b045e267df712a08b20a8270",
    amount: 99.5728625930705,
  },
  {
    address: "0xd9cb69235beae0e999a9c011b6db52fcbf0e531e",
    amount: 99.5728625930705,
  },
  {
    address: "0x53d6e14318b0e19094cb6602bf9d67bb7fd19742",
    amount: 67.890588131639,
  },
  {
    address: "0xB826410A5E1832488b4B24Ba716b75F5cBCA9A69",
    amount: 63.364548922863,
  },
  {
    address: "0x8462ca38165b0fba2989c0d45a691eb112f2e314",
    amount: 58.8385097140871,
  },
  {
    address: "0x70bcbefb3e7ed5650aab12f1f6edb08eb97506e3",
    amount: 58.8385097140871,
  },
  {
    address: "0x72a74b75ac19bf6d19e3cef9edbc754eb57c691b",
    amount: 58.8385097140871,
  },
  {
    address: "0x5b13dae346b64e7ea4c860206709fd73c66986b8",
    amount: 54.3124705053112,
  },
  {
    address: "0xfb0edf0e3700c60d942f4ec500cd6fab09453be7",
    amount: 49.7864312965352,
  },
  {
    address: "0xc8356eb61915c834a1ce9a5cec52ca86094a4735",
    amount: 49.7864312965352,
  },
  {
    address: "0x00c043e8a998218ea0f4f0fe8191999b4b386599",
    amount: 18.1041568351037,
  },
  {
    address: "0x8253c154162b9e4e96b25bf32d228ba5d182760a",
    amount: 18.1041568351037,
  },
  {
    address: "0xbde76499acc2e366880a477cc45272da08fb51dd",
    amount: 9.05207841755186,
  },
  {
    address: "0x46de1ECC3cD2f81e326c579F5E81103Cfda0824A",
    amount: 4.52603920877593,
  },
  {
    address: "0x7655dffcf59fae85b988a7c037dfa5d7ddc4c3a6",
    amount: 4.52603920877593,
  },
];

export const generateTree = (
  claimAllowances: {
    address: string;
    amount: number;
  }[]
) => {
  const leaves = claimAllowances.map((_) => keccak256(_.address as Hex));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  return { tree };
};
