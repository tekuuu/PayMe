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

export const PRIVATE_CARD_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_PRIVATE_CARD_FACTORY_ADDRESS || "0xcfcee6e115D84b5f08b2Eb6E89E0bCCe860e8043";
export const CUSDC_WRAPPER_ADDRESS = process.env.NEXT_PUBLIC_CUSDC_WRAPPER_ADDRESS || "0x2F65250a9c0f038A40c2440c8A15526a2E568331";
export const SUBSCRIPTION_PLAN_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_SUBSCRIPTION_PLAN_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000";
export const ACCOUNT_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_ACCOUNT_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000";
export const REAL_USDC_ADDRESS = process.env.NEXT_PUBLIC_REAL_USDC_ADDRESS || "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
