const { ethers } = require("hardhat");

async function main() {
    try {
        await hre.run("compile");
        console.log("Compile: SUCCESS");
    } catch (e) {
        console.error("Compile: FAILED");
    }
}

main();
