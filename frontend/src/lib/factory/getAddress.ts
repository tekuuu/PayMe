import { Hex, Address } from "viem";
import { PUBLIC_CLIENT } from "@/config/constants/client";
import { FACTORY_ABI } from "@/config/constants";

export async function getAddress(pubKey: { x: Hex; y: Hex }): Promise<Address> {
  const address = await PUBLIC_CLIENT.readContract({
    address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex,
    abi: FACTORY_ABI,
    functionName: "getAddress",
    args: [[pubKey.x, pubKey.y]],
  });

  return address as Address;
}
