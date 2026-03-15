import { UserOperation } from "@/lib/smart-wallet/service/userOps/types";
import { toHex, zeroAddress } from "viem";

// Generous placeholders used only for eth_estimateUserOperationGas input.
// Some bundlers may revert estimation when placeholders are too low for heavy calls (e.g. ERC7984 wrap).
export const DEFAULT_CALL_GAS_LIMIT = BigInt(1_200_000);
export const DEFAULT_VERIFICATION_GAS_LIMIT = BigInt(1_200_000);
export const DEFAULT_PRE_VERIFICATION_GAS = BigInt(120_000);

export const DEFAULT_USER_OP: UserOperation = {
  sender: zeroAddress,
  nonce: BigInt(0),
  initCode: toHex(new Uint8Array(0)),
  callData: toHex(new Uint8Array(0)),
  callGasLimit: DEFAULT_CALL_GAS_LIMIT,
  verificationGasLimit: DEFAULT_VERIFICATION_GAS_LIMIT,
  preVerificationGas: DEFAULT_PRE_VERIFICATION_GAS,
  maxFeePerGas: BigInt(2_000_000_000),
  maxPriorityFeePerGas: BigInt(1_000_000_000),
  paymasterAndData: toHex(new Uint8Array(0)),
  signature: toHex(new Uint8Array(0)),
};

export const emptyHex = toHex(new Uint8Array(0));
