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
  const wrapperAddress = process.env.CUSDC_WRAPPER_ADDRESS;
  if (!wrapperAddress) {
    throw new Error("Missing CUSDC_WRAPPER_ADDRESS in hardhat/.env");
  }

  console.log("Deploying PayMe core contracts...");
  console.log("Using cUSDC wrapper:", wrapperAddress);

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", await deployer.getAddress());

  console.log("\n1. Deploying SubscriptionPlanRegistry");
  const PlanRegistry = await ethers.getContractFactory("SubscriptionPlanRegistry");
  const planRegistry = await PlanRegistry.deploy();
  await planRegistry.waitForDeployment();
  const planRegistryAddress = await planRegistry.getAddress();
  console.log("  => SubscriptionPlanRegistry:", planRegistryAddress);

  console.log("\n2. Deploying AccountRegistry");
  const AccountRegistry = await ethers.getContractFactory("AccountRegistry");
  const accountRegistry = await AccountRegistry.deploy();
  await accountRegistry.waitForDeployment();
  const accountRegistryAddress = await accountRegistry.getAddress();
  console.log("  => AccountRegistry:", accountRegistryAddress);

  console.log("\n3. Deploying CardFactory (embeds latest PrivateCard bytecode)");
  const CardFactory = await ethers.getContractFactory("CardFactory");
  const cardFactory = await CardFactory.deploy(wrapperAddress);
  await cardFactory.waitForDeployment();
  const cardFactoryAddress = await cardFactory.getAddress();
  console.log("  => CardFactory:", cardFactoryAddress);

  const envFiles = [
    path.resolve(__dirname, "..", ".env"),
    path.resolve(__dirname, "..", "..", "frontend", ".env.local"),
  ];

  for (const envFile of envFiles) {
    await setEnvKey(envFile, "NEXT_PUBLIC_PRIVATE_CARD_FACTORY_ADDRESS", cardFactoryAddress);
    await setEnvKey(envFile, "NEXT_PUBLIC_SUBSCRIPTION_PLAN_REGISTRY_ADDRESS", planRegistryAddress);
    await setEnvKey(envFile, "NEXT_PUBLIC_ACCOUNT_REGISTRY_ADDRESS", accountRegistryAddress);
    console.log("Updated env file:", envFile);
  }

  console.log("\n✅ Done");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

