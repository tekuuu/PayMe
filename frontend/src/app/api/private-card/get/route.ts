import { CARD_FACTORY_ABI, PRIVATE_CARD_FACTORY_ADDRESS, PUBLIC_CLIENT } from "@/config/constants";
import { Hex, zeroAddress } from "viem";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const account = searchParams.get("account") as Hex | null;

    if (!account) {
      return Response.json({ error: "account is required" }, { status: 400 });
    }

    const cardAddress = (await PUBLIC_CLIENT.readContract({
      address: PRIVATE_CARD_FACTORY_ADDRESS as Hex,
      abi: CARD_FACTORY_ABI,
      functionName: "getCard",
      args: [account],
    })) as Hex;

    return Response.json({
      account,
      cardAddress,
      hasCard: !!cardAddress && cardAddress !== zeroAddress,
    });
  } catch (error: any) {
    return Response.json({ error: error?.message || "Failed to read card" }, { status: 500 });
  }
}
