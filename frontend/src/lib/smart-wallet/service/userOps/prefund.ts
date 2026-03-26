import { Hex } from "viem";
import { UserOperationAsHex } from "./types";

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

  const topUpResp = await fetch("/api/users/topup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      account,
      targetBalanceWei: requiredNativeBalanceWei.toString(),
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
  };
}
