import { JsonRpcProvider, Contract } from "ethers";

async function main() {
    const provider = new JsonRpcProvider("https://sepolia.infura.io/v3/140f78fd5d8a448297fee48fd6b9a353");
    const factoryAddr = "0x2aD4938836a9AD8117B6A681a574BBd073b3C5c5";
    
    // Check code
    const code = await provider.getCode(factoryAddr);
    console.log("Code length:", code.length);

    const abi = ["function getCard(address user) view returns (address)", "function userToCard(address user) view returns (address)"];
    const contract = new Contract(factoryAddr, abi, provider);

    try {
        const card = await contract.userToCard("0xfc26209B7dfCE09c88205DE9265217963e62431c");
        console.log("Result of userToCard:", card);
    } catch(e) {
        console.log("userToCard reverted.", e);
    }
}
main();
