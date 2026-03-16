const { createPublicClient, http } = require('viem');
const { sepolia } = require('viem/chains');

const client = createPublicClient({
  chain: sepolia,
  transport: http('https://sepolia.infura.io/v3/140f78fd5d8a448297fee48fd6b9a353')
});

const from = "0xfc26209B7dfCE09c88205DE9265217963e62431c";
const to = "0xC7CbD635B1f688D55f3A14b38c9edB7BB7B15bc1";

async function check() {
  try {
    // 1. Check Owner
    const owner = await client.readContract({
      address: to,
      abi: [{ name: 'owner', type: 'function', inputs: [], outputs: [{ type: 'address' }] }],
      functionName: 'owner'
    });
    console.log("Contract Owner:", owner);
    console.log("Sender Match:", owner.toLowerCase() === from.toLowerCase());

    // 2. Try zero handle simulation
    const zeroHandleData = "0x0f201f02" + 
      "000000000000000000000000cc5c64e2ff52d9b2d95b5dc9d4b1e9edf232693b" + // Merchant
      "0000000000000000000000000000000000000000000000000000000000000000" + // Zero Handle
      "0000000000000000000000000000000000000000000000000000000000278d00";   // Period

    try {
      await client.call({ account: from, to, data: zeroHandleData });
      console.log("Zero handle simulation: SUCCESS");
    } catch (e) {
      console.log("Zero handle simulation: FAILED", e.message);
    }

    // 3. Try the original failing data
    const originalData = "0x0f201f02000000000000000000000000cc5c64e2ff52d9b2d95b5dc9d4b1e9edf232693b20a2a6158d4853a7a31aae30d13ad6ae64afda958f000000000000aa36a705000000000000000000000000000000000000000000000000000000000000278d00";
    try {
      await client.call({ account: from, to, data: originalData });
      console.log("Original data simulation: SUCCESS");
    } catch (e) {
      console.log("Original data simulation: FAILED", e.message);
    }
  } catch (err) {
    console.error("Setup failed:", err.message);
  }
}

check();
