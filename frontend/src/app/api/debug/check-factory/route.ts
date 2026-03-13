import { PUBLIC_CLIENT } from "@/config/constants";
import { FACTORY_ABI } from "@/config/constants/factory";
import { Hex, zeroAddress } from "viem";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    console.log("Checking factory for ID:", id);
    
    const userResult = await PUBLIC_CLIENT.readContract({
      address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex,
      abi: FACTORY_ABI,
      functionName: "getUser",
      args: [BigInt(id)],
    });

    return Response.json({
      id,
      userResult,
      factoryAddress: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS,
      // Handle tuple return format
      isRegistered: (userResult as any).account !== zeroAddress
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
