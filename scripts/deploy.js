// scripts/deploy.js
require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const TOKEN_ADDRESS = process.env.USDC_ADDRESS;
    const OPERATOR = process.env.OPERATOR_ADDR;

    if (!TOKEN_ADDRESS || !OPERATOR) {
        throw new Error("❌ Missing USDC_ADDRESS or OPERATOR_ADDRESS in .env");
    }

    console.log("🚀 Deploying EscrowFactory to Arc...");
    console.log("Token:", TOKEN_ADDRESS);
    console.log("Operator:", OPERATOR);

    // Deploy contract
    const Factory = await hre.ethers.getContractFactory("EscrowFactory");
    const factory = await Factory.deploy(TOKEN_ADDRESS, OPERATOR);
    await factory.waitForDeployment();

    const address = await factory.getAddress();
    console.log(`✅ EscrowFactory deployed at: ${address}`);

    // Save address locally
    const filePath = path.join(__dirname, "..", "deployed-addresses.json");
    fs.writeFileSync(filePath, JSON.stringify({ EscrowFactory: address }, null, 2));
    console.log(`📝 Address saved to ${filePath}`);
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
});
