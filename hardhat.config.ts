import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { CHAINID } from "./utils/utils.js";
import dotenv from "dotenv";
dotenv.config();

const ALCHEMY_ETHEREUM_SEPOLIA = process.env.ALCHEMY_ETHEREUM_SEPOLIA!;

const MAIN_DEPLOYER_PRIVATE_KEY = process.env.MAIN_DEPLOYER_PRIVATE_KEY!;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY!;

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: ALCHEMY_ETHEREUM_SEPOLIA,
      accounts: [MAIN_DEPLOYER_PRIVATE_KEY],
      chainId: CHAINID.SEPOLIA,
    },
  },
  verify: {
    etherscan: {
      apiKey: ETHERSCAN_API_KEY,
    },
  },
};

export default config;
