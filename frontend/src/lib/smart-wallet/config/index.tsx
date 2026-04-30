import { http } from "viem";

const bundlerUrl = process.env.NEXT_PUBLIC_BUNDLER_URL;
const publicRpcUrl = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://ethereum-sepolia-rpc.publicnode.com";

if (!bundlerUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    "[SmartWallet] NEXT_PUBLIC_BUNDLER_URL is not set. " +
    "Account Abstraction operations (eth_sendUserOperation, eth_estimateUserOperationGas) will fail."
  );
}

// The bundler endpoint handles AA methods (eth_sendUserOperation, eth_estimateUserOperationGas).
// We must NOT rely on public RPC providers for these calls, since most do not implement AA methods.
export const transport = http(bundlerUrl || publicRpcUrl);

// Separate public-only transport for reading chain data (balances, blocks, etc.)
export const publicTransport = http(publicRpcUrl);

