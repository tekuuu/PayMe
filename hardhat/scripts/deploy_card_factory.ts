import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";
import { promises as fs } from "fs";

async function setEnvKey(filePath: string, key: string, value: string) {
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

async function main(hre: HardhatRuntimeEnvironment) {
  const wrapperAddress = process.env.CUSDC_WRAPPER_ADDRESS;
  if (!wrapperAddress) {
    throw new Error("CUSDC_WRAPPER_ADDRESS is not set in env");
  }

  const Factory = await hre.ethers.getContractFactory("CardFactory");
  const factory = await Factory.deploy(wrapperAddress);
  await factory.deployed();

  const factoryAddress = factory.address;
  console.log("CardFactory deployed to:", factoryAddress);

  const projectRoot = path.resolve(__dirname, "..", "");
  const frontendEnv = path.resolve(projectRoot, "..", "frontend", ".env.local");
  const baseEnv = path.resolve(projectRoot, ".env");

  await setEnvKey(baseEnv, "NEXT_PUBLIC_PRIVATE_CARD_FACTORY_ADDRESS", factoryAddress);
  await setEnvKey(frontendEnv, "NEXT_PUBLIC_PRIVATE_CARD_FACTORY_ADDRESS", factoryAddress);

  console.log("Updated .env and frontend/.env.local with the new CardFactory address");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});