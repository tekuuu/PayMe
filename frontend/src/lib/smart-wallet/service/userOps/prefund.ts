import { Hex } from "viem";
import { ENTRYPOINT_ADDRESS, PUBLIC_CLIENT } from "@/config/constants";
import { UserOperationAsHex } from "./types";

const ENTRYPOINT_READ_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export function getRequiredNativeBalanceWei(args: {
  userOp: UserOperationAsHex;
  additionalExecutionValueWei?: bigint;
}): bigint {
  const { userOp, additionalExecutionValueWei = 0n } = args;

  const estimatedGasUnits =
    BigInt(userOp.callGasLimit) +
    BigInt(userOp.verificationGasLimit) +
    BigInt(userOp.preVerificationGas);

  const estimatedPrefundWei = estimatedGasUnits * BigInt(userOp.maxFeePerGas);
  return additionalExecutionValueWei + estimatedPrefundWei;
}

export async function ensureUserOpPrefund(args: {
  account: Hex;
  userOp: UserOperationAsHex;
  additionalExecutionValueWei?: bigint;
  requiredNativeBalanceWei?: bigint;
}) {
  const {
    account,
    userOp,
    additionalExecutionValueWei = 0n,
    requiredNativeBalanceWei = getRequiredNativeBalanceWei({
      userOp,
      additionalExecutionValueWei,
    }),
  } = args;

  let targetBalanceWei = requiredNativeBalanceWei;
  let currentWalletBalance: bigint | undefined;
  let entryPointDeposit = 0n;

  try {
    const [walletBal, depositBal] = await Promise.all([
      PUBLIC_CLIENT.getBalance({ address: account }),
      PUBLIC_CLIENT.readContract({
        address: ENTRYPOINT_ADDRESS,
        abi: ENTRYPOINT_READ_ABI,
        functionName: "balanceOf",
        args: [account],
      }) as Promise<bigint>,
    ]);

    currentWalletBalance = walletBal;
    entryPointDeposit = depositBal;

    const requiredFromWallet =
      requiredNativeBalanceWei > entryPointDeposit
        ? requiredNativeBalanceWei - entryPointDeposit
        : 0n;

    if (currentWalletBalance >= requiredFromWallet) {
      return {
        toppedUp: false,
        balanceBefore: currentWalletBalance.toString(),
      };
    }

    targetBalanceWei = requiredFromWallet;
  } catch {
    // Fall back to wallet-only targeting if balance/deposit reads fail.
  }

  const topUpResp = await fetch("/api/users/topup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      account,
      targetBalanceWei: targetBalanceWei.toString(),
    }),
  });

  const topUpResult = await topUpResp.json().catch(() => ({}));
  if (!topUpResp.ok) {
    throw new Error(topUpResult?.error || "Failed to top up smart wallet for prefund");
  }

  return topUpResult as {
    toppedUp?: boolean;
    txHash?: Hex;
    amount?: string;
    balanceBefore?: string;
    balanceAfter?: string;
  };
}
