import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { promises as fs } from "fs";
import path from "path";

async function setEnvKey(filePath: string, key: string, value: string) {
    let content = "";
    try {
        content = await fs.readFile(filePath, "utf8");
    } catch {
        content = "";
    }

    const keyRe = new RegExp(`^${key}\\s*=.*$`, "m");
    if (keyRe.test(content)) {
        content = content.replace(keyRe, `${key}=${value}`);
    } else {
        if (content.length > 0 && !content.endsWith("\n")) content += "\n";
        content += `${key}=${value}\n`;
    }

    await fs.writeFile(filePath, content, "utf8");
}

const func: DeployFunction = async function (_hre) {
    console.log("Deploying CardFactory...");

    const wrapperAddress = process.env.CUSDC_WRAPPER_ADDRESS;
    if (!wrapperAddress) {
        throw new Error("Missing CUSDC_WRAPPER_ADDRESS in environment");
    }

    const factoryFactory = await ethers.getContractFactory("CardFactory");
    const factory = await factoryFactory.deploy(wrapperAddress);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();

    console.log("CardFactory deployed to:", factoryAddress);

    const envFiles = [
        path.resolve(__dirname, "..", ".env"),
        path.resolve(__dirname, "..", "..", "frontend", ".env.local"),
    ];

    for (const envFile of envFiles) {
        try {
            await setEnvKey(envFile, "NEXT_PUBLIC_PRIVATE_CARD_FACTORY_ADDRESS", factoryAddress);
            console.log(`Updated ${envFile} NEXT_PUBLIC_PRIVATE_CARD_FACTORY_ADDRESS=${factoryAddress}`);
        } catch (err) {
            console.warn(`Cannot update env file ${envFile}:`, err);
        }
    }
};

func.tags = ["cardfactory"];

export default func;
