import { CHAIN, PUBLIC_CLIENT, transport } from "@/config/constants";
import { Hex, createWalletClient, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const TARGET_BALANCE_WEI = parseEther("0.00009");
const MIN_BALANCE_WEI = TARGET_BALANCE_WEI;

export async function POST(req: Request) {
  try {
    const { account, targetBalanceWei } = (await req.json()) as { account: Hex; targetBalanceWei?: string };

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
    const targetBalance = targetBalanceWei ? BigInt(targetBalanceWei) : TARGET_BALANCE_WEI;
    const minBalance = targetBalance;

    if (balanceBefore >= minBalance) {
      return Response.json({
        toppedUp: false,
        balanceBefore: balanceBefore.toString(),
      });
    }

    const topUpAmount = targetBalance - balanceBefore;
    const txHash = await walletClient.sendTransaction({
      to: account,
      value: topUpAmount,
    });

    // Wait for funding to be mined before returning, otherwise the next
    // UserOperation simulation can still fail with AA21 (prefund not visible yet).
    await PUBLIC_CLIENT.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1,
      timeout: 120_000,
    });

    const balanceAfter = await PUBLIC_CLIENT.getBalance({ address: account });

    return Response.json({
      toppedUp: true,
      txHash,
      amount: topUpAmount.toString(),
      balanceBefore: balanceBefore.toString(),
      balanceAfter: balanceAfter.toString(),
    });
  } catch (error: any) {
    return Response.json({ error: error?.message || "Top-up failed" }, { status: 500 });
  }
}
