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

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying registries with account:", await deployer.getAddress());

  console.log("\n1) Deploying SubscriptionPlanRegistry...");
  const PlanRegistry = await ethers.getContractFactory("SubscriptionPlanRegistry");
  const planRegistry = await PlanRegistry.deploy();
  await planRegistry.waitForDeployment();
  const planRegistryAddress = await planRegistry.getAddress();
  console.log("SubscriptionPlanRegistry:", planRegistryAddress);

  console.log("\n2) Deploying AccountRegistry...");
  const AccountRegistry = await ethers.getContractFactory("AccountRegistry");
  const accountRegistry = await AccountRegistry.deploy();
  await accountRegistry.waitForDeployment();
  const accountRegistryAddress = await accountRegistry.getAddress();
  console.log("AccountRegistry:", accountRegistryAddress);

  const envFiles = [
    path.resolve(__dirname, "..", ".env"),
    path.resolve(__dirname, "..", "..", "frontend", ".env.local"),
  ];

  for (const envFile of envFiles) {
    await setEnvKey(envFile, "NEXT_PUBLIC_SUBSCRIPTION_PLAN_REGISTRY_ADDRESS", planRegistryAddress);
    await setEnvKey(envFile, "NEXT_PUBLIC_ACCOUNT_REGISTRY_ADDRESS", accountRegistryAddress);
    console.log("Updated env:", envFile);
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

