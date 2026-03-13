import { fallback, http } from "viem";

const pimlicoBundlerRpcUrl = http("/api/rpc");

const sepoliaRpcUrl = http(process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://ethereum-sepolia-rpc.publicnode.com");

export const transport = fallback([pimlicoBundlerRpcUrl, sepoliaRpcUrl], {
  rank: false,
});
