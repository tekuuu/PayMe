import { createPublicClient, http } from "viem";
import { sepolia, mainnet } from "viem/chains";

export const CHAIN = {
  ...sepolia,
};

const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://sepolia.infura.io/v3/140f78fd5d8a448297fee48fd6b9a353";
const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS || "0xDD0f9cB4Cf53d28b976C13e7ee4a169F841924c0";

console.log("Initializing Web3 Client with RPC:", rpcEndpoint);
console.log("Using Factory Address:", factoryAddress);

export const transport = http(rpcEndpoint);

export const PUBLIC_CLIENT = createPublicClient({
  chain: sepolia,
  transport,
});

export const MAINNET_PUBLIC_CLIENT = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const PRIVATE_CARD_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_PRIVATE_CARD_FACTORY_ADDRESS || "0x318a371b873f3348b39730b73CF342570B71959D";
export const CUSDC_WRAPPER_ADDRESS = process.env.NEXT_PUBLIC_CUSDC_WRAPPER_ADDRESS || "0x874d3880e937b457F78C2129FAD36ABFE4f80535";
export const REAL_USDC_ADDRESS = process.env.NEXT_PUBLIC_REAL_USDC_ADDRESS || "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

