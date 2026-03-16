const fs = require('fs');
const path = 'src/lib/smart-wallet/service/userOps/builder.ts';
let code = fs.readFileSync(path, 'utf8');

const regex = /return \{\s*sender: account,\s*nonce: toHex\(resolvedNonce\),\s*initCode,\s*callData,\s*callGasLimit: toHex\(BigInt\(1000000\)\),\s*verificationGasLimit: toHex\(BigInt\(500000\)\),\s*preVerificationGas: toHex\(BigInt\(100000\)\),\s*maxFeePerGas: toHex\(resolvedMaxFeePerGas\),\s*maxPriorityFeePerGas: toHex\(resolvedMaxPriorityFeePerGas\),\s*paymasterAndData: toHex\(new Uint8Array\(0\)\),\s*signature: toHex\(new Uint8Array\(0\)\),\s*\};/m;

const replacement = `const partialOp = {
      sender: account,
      nonce: toHex(resolvedNonce),
      initCode,
      callData,
      maxFeePerGas: toHex(resolvedMaxFeePerGas),
      maxPriorityFeePerGas: toHex(resolvedMaxPriorityFeePerGas),
      paymasterAndData: "0x",
      signature: "0x",
      callGasLimit: "0x0",
      verificationGasLimit: "0x0",
      preVerificationGas: "0x0",
    } as any;
    
    try {
        const gasEstimate = await smartWallet.estimateUserOperationGas({ userOp: partialOp });
        return {
          ...partialOp,
          callGasLimit: toHex(BigInt(gasEstimate.callGasLimit) + BigInt(60000)),
          verificationGasLimit: toHex(BigInt(gasEstimate.verificationGasLimit) + BigInt(60000)),
          preVerificationGas: toHex(BigInt(gasEstimate.preVerificationGas) + BigInt(20000)),
        };
    } catch(e) {
        console.warn("Gas estimation failed, falling back to generous defaults", e);
        return {
          ...partialOp,
          callGasLimit: toHex(BigInt(5000000)),
          verificationGasLimit: toHex(BigInt(3000000)),
          preVerificationGas: toHex(BigInt(500000)),
        }
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync(path, code);
