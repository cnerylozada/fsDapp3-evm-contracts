import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyTokenModule = buildModule("MyTokenModule", (m) => {
  const myTokenContract = m.contract("MyToken", []);

  return { myTokenContract };
});

export default MyTokenModule;
