// test/EscrowFactory.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Test Setup for EscrowFactory + MockUSDC
 * This suite covers:
 * - Deployment of a MockUSDC token
 * - Deployment of EscrowFactory (linked to token + operator)
 * - Creation of a new Escrow contract
 * - Verification of emitted events and stored escrow addresses
 */

describe("EscrowFactory Deployment + Escrow Creation", function () {
    /**
     * 🔧 Fixture: Deploy MockUSDC + EscrowFactory
     * This function runs once and Hardhat snapshots the state.
     * Before each test, it restores this snapshot for fast test execution.
     */
    async function deployFixture() {
        const [owner, seller, operator, buyer] = await ethers.getSigners();

        // --- Deploy a Mock USDC token (6 decimals like real USDC) ---
        const MockUSDC = await ethers.getContractFactory("MockUSDC");
        const mockUSDC = await MockUSDC.deploy();
        await mockUSDC.waitForDeployment();
        await mockUSDC.mint(owner.address, ethers.parseUnits("1000000", 6)); // Mint 1M USDC to owner
        const tokenAddress = await mockUSDC.getAddress();

        // --- Deploy EscrowFactory with token + operator address ---
        const EscrowFactory = await ethers.getContractFactory("EscrowFactory");
        const factory = await EscrowFactory.deploy(tokenAddress, operator.address);
        await factory.waitForDeployment();
        const factoryAddress = await factory.getAddress();

        return { owner, seller, operator, buyer, mockUSDC, tokenAddress, factory, factoryAddress };
    }

    // 🧪 1. Test: Factory and token deployment
    it("Should deploy MockUSDC and EscrowFactory correctly", async function () {
        const { factory, mockUSDC, operator } = await loadFixture(deployFixture);

        // Token decimals check
        const decimals = await mockUSDC.decimals();
        expect(decimals).to.equal(6);

        // Factory operator check
        expect(await factory.operator()).to.equal(operator.address);
    });

    // 🧪 2. Test: Create a new Escrow via the factory
    it("Should deploy factory and create a new escrow", async function () {
        const { factory, seller, mockUSDC } = await loadFixture(deployFixture);

        // Mock product details
        const productId = "BLACK_TSHIRT_001";
        const unitPrice = ethers.parseUnits("10", 6); // $10 USDC, 6 decimals
        const unitsNeeded = 500;
        const dueTimestamp = Math.floor(Date.now() / 1000) + 86400; // +1 day

        // --- Call createEscrow ---
        const tx = await factory.createEscrow(
            seller.address,
            productId,
            unitPrice,
            unitsNeeded,
            dueTimestamp
        );

        // Wait for tx confirmation
        const receipt = await tx.wait();

        // Find the "EscrowCreated" event in the logs
        const event = receipt.logs
            .map((log) => {
                try {
                    return factory.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .find((e) => e && e.name === "EscrowCreated");

        expect(event).to.not.be.undefined;

        // Extract event details
        const escrowAddr = event.args.escrow;
        const eventSeller = event.args.seller;
        const eventProduct = event.args.productId;

        // Verify event data
        expect(eventSeller).to.equal(seller.address);
        expect(eventProduct).to.equal(productId);
        expect(escrowAddr).to.properAddress;

        // Verify that the new escrow address is saved in the factory’s array
        const count = await factory.getEscrowsCount();
        expect(count).to.equal(1);

        // Optional: log the address for manual verification
        console.log("\n✅ New Escrow Deployed at:", escrowAddr);
    });
});
