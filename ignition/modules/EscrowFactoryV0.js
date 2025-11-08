const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
require("dotenv").config();

/**
 * Deploys the EscrowFactory contract on Arc testnet
 */
module.exports = buildModule("EscrowFactoryModule", (m) => {
  const usdcAddress = m.getParameter("usdcAddress", process.env.USDC_ADDRESS);
  const operator = m.getParameter("operator", process.env.OPERATOR_ADDR);

  // Deploy EscrowFactory with (token, operator)
  const factory = m.contract("EscrowFactory", [usdcAddress, operator]);

  return { factory };
});
