import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyTokenModule = buildModule("MyTokenModule", (m) => {
  const defaultAdmin = m.getAccount(0);
  const minter = m.getAccount(1);

  const myTokenContract = m.contract("MyToken", [
    defaultAdmin,
    defaultAdmin,
    minter,
  ]);

  return { myTokenContract };
});

export default MyTokenModule;
