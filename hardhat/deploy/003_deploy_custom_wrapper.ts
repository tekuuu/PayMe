import { ethers } from "hardhat";

async function main() {
    console.log("Deploying Custom ERC7984 Wrapper...");

    // The real USDC address on Sepolia
    // You can verify this is real Circle USDC testnet token
    const realUsdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

    // 1. Deploy the new Confidential ERC20 Wrapper for the real USDC
    console.log("1. Deploying SepoliaUSDCWrapper for:", realUsdcAddress);
    const WrapperFactory = await ethers.getContractFactory("SepoliaUSDCWrapper");
    const wrapper = await WrapperFactory.deploy(realUsdcAddress);
    await wrapper.waitForDeployment();
    const wrapperAddress = await wrapper.getAddress();
    console.log("  => SepoliaUSDCWrapper deployed to:", wrapperAddress);

    const deployCardFactory = String(process.env.DEPLOY_CARD_FACTORY || "").toLowerCase() === "true";
    if (deployCardFactory) {
        // 2. Deploy the CardFactory pointing directly to our new Wrapper
        console.log("\n2. Deploying CardFactory (DEPLOY_CARD_FACTORY=true)");
        const Factory = await ethers.getContractFactory("CardFactory");
        const factory = await Factory.deploy(wrapperAddress);
        await factory.waitForDeployment();
        const factoryAddress = await factory.getAddress();
        console.log("  => CardFactory deployed to:", factoryAddress);
    } else {
        console.log("\n2. Skipping CardFactory deployment (set DEPLOY_CARD_FACTORY=true to enable)");
    }

    console.log("\n✅ Deployment complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
