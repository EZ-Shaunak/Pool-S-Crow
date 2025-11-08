require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const filePath = path.join(__dirname, "..", "deployed-addresses.json");
    const { EscrowFactory } = JSON.parse(fs.readFileSync(filePath));

    const TOKEN_ADDRESS = process.env.USDC_ADDRESS;
    const OPERATOR = process.env.OPERATOR_ADDR;

    console.log("🔍 Verifying EscrowFactory on Arc Explorer...");
    console.log("📍 Contract:", EscrowFactory);

    await hre.run("verify:verify", {
        address: EscrowFactory,
        constructorArguments: [TOKEN_ADDRESS, OPERATOR],
    });

    console.log("✅ EscrowFactory verified successfully!");
}

main().catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exitCode = 1;
});
