import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Deploying SimpleAccountFactory...");

  const entryPointAddress = process.env.ENTRYPOINT_ADDRESS || "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  console.log("EntryPoint for deployment:", entryPointAddress);

  const Factory = await ethers.getContractFactory("SimpleAccountFactory");
  const factory = await Factory.deploy(entryPointAddress);

  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();

  console.log("SimpleAccountFactory deployed to:", factoryAddress);
  console.log("EntryPoint used:", entryPointAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
