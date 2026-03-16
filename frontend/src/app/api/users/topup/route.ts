import { CHAIN, PUBLIC_CLIENT, transport } from "@/config/constants";
import { Hex, createWalletClient, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const TARGET_BALANCE_WEI = parseEther("0.00009");
const MIN_BALANCE_WEI = TARGET_BALANCE_WEI;

export async function POST(req: Request) {
  try {
    const { account } = (await req.json()) as { account: Hex };

    if (!account) {
      return Response.json({ error: "account is required" }, { status: 400 });
    }

    const relayerKey = process.env.RELAYER_PRIVATE_KEY as Hex | undefined;
    if (!relayerKey) {
      return Response.json({ error: "RELAYER_PRIVATE_KEY is not configured" }, { status: 500 });
    }

    const relayer = privateKeyToAccount(relayerKey);
    const walletClient = createWalletClient({
      account: relayer,
      chain: CHAIN,
      transport,
    });

    const balanceBefore = await PUBLIC_CLIENT.getBalance({ address: account });

    if (balanceBefore >= MIN_BALANCE_WEI) {
      return Response.json({
        toppedUp: false,
        balanceBefore: balanceBefore.toString(),
      });
    }

    const topUpAmount = TARGET_BALANCE_WEI - balanceBefore;
    const txHash = await walletClient.sendTransaction({
      to: account,
      value: topUpAmount,
    });

    return Response.json({
      toppedUp: true,
      txHash,
      amount: topUpAmount.toString(),
      balanceBefore: balanceBefore.toString(),
    });
  } catch (error: any) {
    return Response.json({ error: error?.message || "Top-up failed" }, { status: 500 });
  }
}
