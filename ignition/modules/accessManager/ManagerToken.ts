import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { toFunctionSelector } from "viem";

const ManagerTokenModule = buildModule("ManagerTokenModule", (m) => {
  const _defaultAdmin = m.getAccount(0);
  const _minterAccount = m.getAccount(1);

  const accessManagerWrapperContract = m.contract("AccessManagerWrapper", [
    _defaultAdmin,
  ]);

  const managerTokenContract = m.contract("ManagerToken", [
    accessManagerWrapperContract,
  ]);

  const MINTER_ROLE = BigInt(1);
  m.call(accessManagerWrapperContract, "setTargetFunctionRole", [
    managerTokenContract,
    [toFunctionSelector("mint(address,uint256)")],
    MINTER_ROLE,
  ]);

  m.call(accessManagerWrapperContract, "grantRole", [
    MINTER_ROLE,
    _minterAccount,
    BigInt(0),
  ]);

  return { accessManagerWrapperContract, managerTokenContract };
});

export default ManagerTokenModule;
