import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SimpleAccountFactory...");

  // The EntryPoint address for v0.6 is the same on many networks (Sepolia, Local)
  // If you are on a custom FHEVM node, you may need to deploy EntryPoint first.
  const entryPointAddress = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

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
