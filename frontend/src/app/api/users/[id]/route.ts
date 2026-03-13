import { PUBLIC_CLIENT } from "@/config/constants/client";
import { FACTORY_ABI } from "@/config/constants/factory";
import { Hex, stringify, toHex, zeroAddress } from "viem";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const user = (await PUBLIC_CLIENT.readContract({
      address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex,
      abi: FACTORY_ABI,
      functionName: "getUser",
      args: [BigInt(id)],
    })) as { id: bigint; publicKey: [Hex, Hex]; account: `0x${string}` };

    let balance = BigInt(0);

    // Using public client with fallback
    if (user?.account && user.account !== zeroAddress) {
      try {
        const balanceBigInt = await PUBLIC_CLIENT.getBalance({
          address: user.account,
          blockTag: "latest",
        });
        balance = balanceBigInt;
      } catch (e) {
        console.error("RPC balance fetch failed", e);
      }
    }

    return Response.json(
      JSON.parse(stringify({ ...user, id: toHex(user.id), balance })),
    );
  } catch (error: any) {
    console.error("Error in GET /api/users/[id]:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
