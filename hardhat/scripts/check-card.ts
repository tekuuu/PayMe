import { ethers } from "hardhat";

async function main() {
    const factoryAddr = "0x2aD4938836a9AD8117B6A681a574BBd073b3C5c5";
    const Factory = await ethers.getContractAt("CardFactory", factoryAddr);
    try {
        const cusdc = await Factory.getCard("0xfc26209B7dfCE09c88205DE9265217963e62431c");
        console.log("Card is:", cusdc);
    } catch(e: any) {
        console.log("Error finding Card:", e.message);
    }
}
main();
