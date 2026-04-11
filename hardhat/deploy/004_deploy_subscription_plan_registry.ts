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
    console.log("Deploying SubscriptionPlanRegistry...");

    const registryFactory = await ethers.getContractFactory("SubscriptionPlanRegistry");
    const registry = await registryFactory.deploy();
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();

    console.log("SubscriptionPlanRegistry deployed to:", registryAddress);

    const envFiles = [
        path.resolve(__dirname, "..", ".env"),
        path.resolve(__dirname, "..", "..", "frontend", ".env.local"),
    ];

    for (const envFile of envFiles) {
        try {
            await setEnvKey(envFile, "NEXT_PUBLIC_SUBSCRIPTION_PLAN_REGISTRY_ADDRESS", registryAddress);
            console.log(`Updated ${envFile} NEXT_PUBLIC_SUBSCRIPTION_PLAN_REGISTRY_ADDRESS=${registryAddress}`);
        } catch (err) {
            console.warn(`Cannot update env file ${envFile}:`, err);
        }
    }
};

func.tags = ["subscription-plan-registry"];

export default func;

