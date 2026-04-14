import { Address, Hex, encodeFunctionData, getAddress, isAddress, keccak256, stringToHex, toHex, zeroAddress } from "viem";
import {
  CHAIN,
  PUBLIC_CLIENT,
  SUBSCRIPTION_PLAN_REGISTRY_ABI,
  SUBSCRIPTION_PLAN_REGISTRY_ADDRESS,
} from "@/config/constants";
import { smartWallet } from "@/lib/smart-wallet";
import { UserOpBuilder } from "@/lib/smart-wallet/service/userOps";
import { UserOperationAsHex } from "@/lib/smart-wallet/service/userOps/types";
import { ensureUserOpPrefund } from "@/lib/smart-wallet/service/userOps/prefund";

type UserOpIdentity = {
  account: Address;
  keyId: Hex;
};

export type OnChainPlanRecord = {
  planRef: Hex;
  merchant: Address;
  periodSeconds: bigint;
  priceMicros: bigint;
  termsHash: Hex;
  active: boolean;
  createdAt: bigint;
  updatedAt: bigint;
};

function ensureRegistryAddress() {
  if (!isAddress(SUBSCRIPTION_PLAN_REGISTRY_ADDRESS) || SUBSCRIPTION_PLAN_REGISTRY_ADDRESS === zeroAddress) {
    throw new Error(
      "Subscription plan registry is not configured. Set NEXT_PUBLIC_SUBSCRIPTION_PLAN_REGISTRY_ADDRESS."
    );
  }
  return getAddress(SUBSCRIPTION_PLAN_REGISTRY_ADDRESS);
}

function ensureIdentity(identity: UserOpIdentity) {
  if (!isAddress(identity.account) || identity.account === zeroAddress) {
    throw new Error("Invalid merchant smart wallet account.");
  }
}

function isRetryableGasError(error: unknown) {
  const message = String((error as any)?.message || "").toLowerCase();
  return (
    message.includes("aa40") ||
    message.includes("aa23") ||
    message.includes("reverted (or oog)") ||
    message.includes("out of gas") ||
    message.includes("over verificationgaslimit") ||
    message.includes("preverificationgas is not enough")
  );
}

function maxBigInt(values: bigint[]) {
  let best = values[0] ?? 0n;
  for (const value of values) {
    if (value > best) best = value;
  }
  return best;
}

function bumpUserOpGas(userOp: UserOperationAsHex): UserOperationAsHex {
  const call = BigInt(userOp.callGasLimit);
  const verification = BigInt(userOp.verificationGasLimit);
  const pre = BigInt(userOp.preVerificationGas);

  const bump = (value: bigint, bps: bigint, extra: bigint) =>
    ((value * (10_000n + bps) + 9_999n) / 10_000n) + extra;

  const bumpedCall = maxBigInt([bump(call, 4000n, 50_000n), 350_000n]);
  const bumpedVerification = maxBigInt([bump(verification, 7000n, 150_000n), 1_200_000n]);
  const bumpedPre = maxBigInt([bump(pre, 4000n, 20_000n), 150_000n]);

  return {
    ...userOp,
    callGasLimit: toHex(bumpedCall),
    verificationGasLimit: toHex(bumpedVerification),
    preVerificationGas: toHex(bumpedPre),
  };
}

function hardenPlanRegistryUserOpGas(userOp: UserOperationAsHex): UserOperationAsHex {
  const call = BigInt(userOp.callGasLimit);
  const verification = BigInt(userOp.verificationGasLimit);
  const pre = BigInt(userOp.preVerificationGas);

  return {
    ...userOp,
    callGasLimit: toHex(maxBigInt([call, 380_000n])),
    verificationGasLimit: toHex(maxBigInt([verification, 1_000_000n])),
    preVerificationGas: toHex(maxBigInt([pre, 150_000n])),
  };
}

async function sendRegistryCall(input: { identity: UserOpIdentity; data: Hex }) {
  ensureIdentity(input.identity);
  const registry = ensureRegistryAddress();

  smartWallet.init();
  const builder = new UserOpBuilder(CHAIN);
  const call = {
    dest: registry,
    value: 0n,
    data: input.data,
  };

  const baseUserOp = await builder.buildUserOp({
    calls: [call],
    keyId: input.identity.keyId,
  });
  const userOp = hardenPlanRegistryUserOpGas(baseUserOp);

  const submit = async (candidate: UserOperationAsHex) => {
    await ensureUserOpPrefund({
      account: input.identity.account as Hex,
      userOp: candidate,
    });

    const hash = await smartWallet.sendUserOperation({ userOp: candidate });
    const receipt = await smartWallet.waitForUserOperationReceipt({ hash });
    if (!receipt || receipt.success === false || receipt.receipt?.status !== "0x1") {
      throw new Error("Plan registry transaction reverted.");
    }
    return receipt.receipt?.transactionHash as string | undefined;
  };

  try {
    return await submit(userOp);
  } catch (error) {
    if (!isRetryableGasError(error)) {
      throw error;
    }
    return submit(bumpUserOpGas(userOp));
  }
}

export function createPlanRef(input: { merchantAddress: Address; name: string; amountRefMicros: string; intervalSeconds: number }) {
  const seed = `${input.merchantAddress}|${input.name}|${input.amountRefMicros}|${input.intervalSeconds}|${Date.now()}|${Math.random()}`;
  return keccak256(stringToHex(seed)) as Hex;
}

export function createPlanTermsHash(input: {
  name: string;
  description?: string;
  interval: string;
  billingIntervalSeconds: number;
  amountRefMicros: string;
}) {
  const normalized = JSON.stringify({
    v: 1,
    name: input.name.trim(),
    description: (input.description || "").trim(),
    interval: input.interval,
    billingIntervalSeconds: Math.max(1, Math.floor(input.billingIntervalSeconds)),
    amountRefMicros: String(input.amountRefMicros),
  });
  return keccak256(stringToHex(normalized)) as Hex;
}

export async function createPlanOnChain(input: {
  identity: UserOpIdentity;
  planRef: Hex;
  periodSeconds: number;
  priceMicros: string;
  termsHash: Hex;
}) {
  const data = encodeFunctionData({
    abi: SUBSCRIPTION_PLAN_REGISTRY_ABI,
    functionName: "createPlan",
    args: [input.planRef, BigInt(input.periodSeconds), BigInt(input.priceMicros), input.termsHash],
  });

  return sendRegistryCall({
    identity: input.identity,
    data,
  });
}

export async function updatePlanOnChain(input: {
  identity: UserOpIdentity;
  planRef: Hex;
  periodSeconds: number;
  priceMicros: string;
  termsHash: Hex;
  active: boolean;
}) {
  const data = encodeFunctionData({
    abi: SUBSCRIPTION_PLAN_REGISTRY_ABI,
    functionName: "updatePlan",
    args: [input.planRef, BigInt(input.periodSeconds), BigInt(input.priceMicros), input.termsHash, input.active],
  });

  return sendRegistryCall({
    identity: input.identity,
    data,
  });
}

export async function archivePlanOnChain(input: {
  identity: UserOpIdentity;
  planRef: Hex;
}) {
  const data = encodeFunctionData({
    abi: SUBSCRIPTION_PLAN_REGISTRY_ABI,
    functionName: "archivePlan",
    args: [input.planRef],
  });

  return sendRegistryCall({
    identity: input.identity,
    data,
  });
}

export async function readPlanOnChain(planRef: Hex): Promise<OnChainPlanRecord | null> {
  ensureRegistryAddress();
  const result = (await PUBLIC_CLIENT.readContract({
    address: SUBSCRIPTION_PLAN_REGISTRY_ADDRESS as Address,
    abi: SUBSCRIPTION_PLAN_REGISTRY_ABI,
    functionName: "getPlan",
    args: [planRef],
  })) as {
    merchant: Address;
    periodSeconds: bigint;
    priceMicros: bigint;
    termsHash: Hex;
    active: boolean;
    createdAt: bigint;
    updatedAt: bigint;
  };

  const merchant = getAddress(result.merchant);
  if (merchant === zeroAddress) {
    return null;
  }

  return {
    planRef,
    merchant,
    periodSeconds: result.periodSeconds,
    priceMicros: result.priceMicros,
    termsHash: result.termsHash,
    active: result.active,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

export async function readMerchantPlanRefsOnChain(merchant: Address): Promise<Hex[]> {
  ensureRegistryAddress();
  const refs = (await PUBLIC_CLIENT.readContract({
    address: SUBSCRIPTION_PLAN_REGISTRY_ADDRESS as Address,
    abi: SUBSCRIPTION_PLAN_REGISTRY_ABI,
    functionName: "merchantPlanRefs",
    args: [merchant],
  })) as Hex[];

  return refs.filter((ref) => /^0x[0-9a-fA-F]{64}$/.test(ref));
}
