import { ENTRYPOINT_ADDRESS } from "@/config/constants";
import { SmartWalletClient } from "@/lib/smart-wallet/service/smart-wallet";
import { UserOperationAsHex } from "@/lib/smart-wallet/service/userOps";
import { Hex } from "viem";

export async function getUserOperationHash(
  client: SmartWalletClient,
  args: { userOp: UserOperationAsHex },
): Promise<Hex> {
  return await client.request({
    method: "eth_getUserOperationHash" as any,
    params: [args.userOp, ENTRYPOINT_ADDRESS],
  });
}
