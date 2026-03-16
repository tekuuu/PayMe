const { decodeFunctionData } = require('viem');

const abi = [
  {
    "type": "function",
    "name": "approveSubscription",
    "inputs": [
      { "name": "merchant", "type": "address" },
      { "name": "encryptedMaxPerPeriod", "type": "uint256" },
      { "name": "periodSeconds", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

const data = "0x0f201f02000000000000000000000000cc5c64e2ff52d9b2d95b5dc9d4b1e9edf232693b20a2a6158d4853a7a31aae30d13ad6ae64afda958f000000000000aa36a705000000000000000000000000000000000000000000000000000000000000278d00";

// Manual slice because signature check is failing for some reason (maybe spacing/formatting in my manual string?)
// 0x0f201f02 (4 bytes)
// address (32 bytes)
// uint256 (32 bytes)
// uint256 (32 bytes)

const merchant = "0x" + data.slice(10, 74).replace(/^0+/, '');
const handle = "0x" + data.slice(74, 138);
const period = parseInt(data.slice(138), 16);

console.log({ merchant, handle, period });
