import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PanagramModule", (m) => {
  const iniitalAdmin = m.getAccount(0);
  const panagramAccessManagerContract = m.contract("PanagramAccessManager", [
    iniitalAdmin,
  ]);

  const BACKEND_SIGNER_ROLE = BigInt(1);
  m.call(panagramAccessManagerContract, "grantRole", [
    BACKEND_SIGNER_ROLE,
    iniitalAdmin,
    BigInt(0),
  ]);

  const mockVerifierContract = m.contract("MockVerifier");

  const panagramContract = m.contract("Panagram", [
    panagramAccessManagerContract,
    mockVerifierContract,
  ]);

  return {
    panagramAccessManagerContract,
    mockVerifierContract,
    panagramContract,
  };
});
