const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs/promises");

async function setEnvKey(filePath, key, value) {
  let content = "";
  try {
    content = await fs.readFile(filePath, "utf8");
  } catch {
    content = "";
  }

  const re = new RegExp(`^${key}\\s*=.*$`, "m");
  if (re.test(content)) {
    content = content.replace(re, `${key}=${value}`);
  } else {
    if (content.length > 0 && !content.endsWith("\n")) content += "\n";
    content += `${key}=${value}\n`;
  }

  await fs.writeFile(filePath, content, "utf8");
}

async function main() {
  const wrapperAddress = process.env.CUSDC_WRAPPER_ADDRESS;
  if (!wrapperAddress) {
    throw new Error("CUSDC_WRAPPER_ADDRESS is not set in env");
  }

  const Factory = await ethers.getContractFactory("CardFactory");
  const factory = await Factory.deploy(wrapperAddress);
  await factory.waitForDeployment();

  let factoryAddress = factory.target || factory.address;
  if (!factoryAddress && typeof factory.getAddress === "function") {
    factoryAddress = await factory.getAddress();
  }
  if (!factoryAddress) {
    throw new Error("Failed to read deployed CardFactory address.");
  }
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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});