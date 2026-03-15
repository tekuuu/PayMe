import { ethers } from "hardhat";

async function main() {
    console.log("Deploying CardFactory...");

    const wrapperAddress = process.env.CUSDC_WRAPPER_ADDRESS;
    if (!wrapperAddress) {
        throw new Error("Missing CUSDC_WRAPPER_ADDRESS in environment");
    }

    const Factory = await ethers.getContractFactory("CardFactory");

    const factory = await Factory.deploy(wrapperAddress);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("CardFactory deployed to:", factoryAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
