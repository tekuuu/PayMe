const { ethers } = require("ethers");
async function main() {
  const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
  const factoryAddr = "0x2aD4938836a9AD8117B6A681a574BBd073b3C5c5";
  const abi = ["function getCard(address user) view returns (address)"];
  const contract = new ethers.Contract(factoryAddr, abi, provider);
  const card = await contract.getCard("0xfc26209B7dfCE09c88205DE9265217963e62431c");
  console.log("Card Address:", card);
}
main().catch(console.error);
