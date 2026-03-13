import { ENTRYPOINT_ADDRESS } from "@/config/constants";
import { SmartWalletClient } from "@/lib/smart-wallet/service/smart-wallet";
import { UserOperationAsHex } from "@/lib/smart-wallet/service/userOps";

/*  */
export type EstimateUserOperationGasReturnType = {
  preVerificationGas: bigint;
  verificationGasLimit: bigint;
  callGasLimit: bigint;
};

export async function estimateUserOperationGas(
  client: SmartWalletClient,
  args: { userOp: UserOperationAsHex },
): Promise<EstimateUserOperationGasReturnType> {
  return await client.request({
    method: "eth_estimateUserOperationGas" as any,
    params: [{ ...args.userOp }, ENTRYPOINT_ADDRESS],
  });
}
