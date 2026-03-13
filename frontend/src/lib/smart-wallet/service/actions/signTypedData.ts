import { SmartWalletClient } from "@/lib/smart-wallet/service/smart-wallet";
import { Hex, hashTypedData } from "viem";

export type SignTypedDataReturnType = Hex;

export async function signTypedData(
  client: SmartWalletClient,
  args: { domain: any; types: any; primaryType: string; message: any; keyId: Hex },
): Promise<SignTypedDataReturnType> {
  const { domain, types, primaryType, message, keyId } = args;

  // 1. Calculate the EIP-712 hash
  const hash = hashTypedData({
    domain,
    types,
    primaryType,
    message,
  });

  // 2. Wrap it for the Smart Account's signature format (version 0x01, no timing 0x000000000000)
  // This matches the format used in builder.ts for UserOps
  const { smartWallet } = await import("@/lib/smart-wallet");
  const builder = (await import("@/lib/smart-wallet/service/userOps")).UserOpBuilder;
  
  // We need to sign exactly as the contract expects. 
  // For SimpleAccount, it usually validates a message hash signed by the owner.
  const msgToSign = hash; 

  // 3. Get the signature from WebAuthn
  const signature = await smartWallet.getSignature(msgToSign, keyId);

  return signature;
}
