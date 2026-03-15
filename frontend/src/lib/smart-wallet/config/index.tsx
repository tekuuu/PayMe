import { http } from "viem";

const pimlicoBundlerUrl = process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL;
const publicRpcUrl = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://ethereum-sepolia-rpc.publicnode.com";

if (!pimlicoBundlerUrl) {
  console.warn(
    "[SmartWallet] NEXT_PUBLIC_PIMLICO_BUNDLER_URL is not set. " +
    "Account Abstraction operations (eth_sendUserOperation, eth_estimateUserOperationGas) will fail."
  );
}

// Pimlico handles ALL bundler-specific + public RPC methods.
// We must NOT fall back to Infura for these calls — Infura doesn't support AA methods.
export const transport = http(pimlicoBundlerUrl || publicRpcUrl);

// Separate public-only transport for reading chain data (balances, blocks, etc.)
export const publicTransport = http(publicRpcUrl);

