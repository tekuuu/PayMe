import {
  Chain,
  GetContractReturnType,
  Hex,
  PublicClient,
  createPublicClient,
  encodeFunctionData,
  encodePacked,
  getContract,
  http,
  toHex,
  parseAbi,
} from "viem";
import { UserOperationAsHex, Call } from "@/lib/smart-wallet/service/userOps/types";
import { ENTRYPOINT_ABI, ENTRYPOINT_ADDRESS, FACTORY_ABI } from "@/config/constants";
import { smartWallet } from "@/lib/smart-wallet";

export class UserOpBuilder {
  public relayer: Hex = "0x061060a65146b3265C62fC8f3AE977c9B27260fF";
  public entryPoint: Hex = ENTRYPOINT_ADDRESS;
  public chain: Chain;
  public publicClient: PublicClient;
  public factoryContract: GetContractReturnType<typeof FACTORY_ABI, PublicClient>;

  constructor(chain: Chain) {
    this.chain = chain;
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
      "https://ethereum-sepolia-rpc.publicnode.com";

    this.publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    this.factoryContract = getContract({
      address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex,
      abi: FACTORY_ABI,
      client: this.publicClient,
    });
  }

  async buildUserOp({
    calls,
    maxFeePerGas,
    maxPriorityFeePerGas,
    keyId,
    nonce,
  }: {
    calls: Call[];
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
    keyId: Hex;
    nonce?: bigint;
  }): Promise<UserOperationAsHex> {
    smartWallet.init();

    let resolvedMaxFeePerGas = maxFeePerGas;
    let resolvedMaxPriorityFeePerGas = maxPriorityFeePerGas;

    if (!resolvedMaxFeePerGas || !resolvedMaxPriorityFeePerGas) {
      try {
        const gasPrice = await smartWallet.client.request({
          method: "pimlico_getUserOperationGasPrice" as never,
        } as never);
        resolvedMaxFeePerGas = BigInt((gasPrice as any).fast.maxFeePerGas);
        resolvedMaxPriorityFeePerGas = BigInt((gasPrice as any).fast.maxPriorityFeePerGas);
      } catch {
        const fees = await this.publicClient.estimateFeesPerGas();
        resolvedMaxFeePerGas = resolvedMaxFeePerGas ?? fees.maxFeePerGas ?? 0n;
        resolvedMaxPriorityFeePerGas = resolvedMaxPriorityFeePerGas ?? fees.maxPriorityFeePerGas ?? 0n;
      }
    }

    const { account, publicKey } = await this._calculateSmartWalletAddressFromLocalStorage();

    const bytecode = await this.publicClient.getBytecode({
      address: account,
    });

    let initCode = toHex(new Uint8Array(0));
    if (!bytecode || bytecode === "0x" || bytecode === "0x0") {
      ({ initCode } = await this._createInitCode(publicKey));
    }

    const resolvedNonce = nonce ?? (await this._getNonce(account));
    const callData = this._addCallData(calls);

    const partialOp = {
      sender: account,
      nonce: toHex(resolvedNonce),
      initCode,
      callData,
      maxFeePerGas: toHex(resolvedMaxFeePerGas),
      maxPriorityFeePerGas: toHex(resolvedMaxPriorityFeePerGas),
      paymasterAndData: "0x",
      signature: "0x",
      callGasLimit: "0x0",
      verificationGasLimit: "0x0",
      preVerificationGas: "0x0",
    } as any;
    
    try {
        const gasEstimate = await smartWallet.estimateUserOperationGas({ userOp: partialOp });
        return {
          ...partialOp,
          callGasLimit: toHex(BigInt(gasEstimate.callGasLimit) + BigInt(2000000)),
          verificationGasLimit: toHex(BigInt(gasEstimate.verificationGasLimit) + BigInt(2000000)),
          preVerificationGas: toHex(BigInt(gasEstimate.preVerificationGas) + BigInt(20000)),
        };
    } catch(e) {
        console.warn("Gas estimation failed, falling back to generous defaults", e);
        return {
          ...partialOp,
          callGasLimit: toHex(BigInt(5000000)),
          verificationGasLimit: toHex(BigInt(3000000)),
          preVerificationGas: toHex(BigInt(500000)),
        }
    }
  }

  async getSenderAddress(keyId: Hex): Promise<Hex> {
    const { account } = await this._calculateSmartWalletAddressFromLocalStorage();
    return account;
  }

  private async _calculateSmartWalletAddressFromLocalStorage(): Promise<{ account: Hex; publicKey: [bigint, bigint] }> {
    const meStr = localStorage.getItem("passkeys4337.me");
    if (!meStr) throw new Error("User session not found in localStorage");
    
    const me = JSON.parse(meStr);
    const publicKey: [bigint, bigint] = [BigInt(me.pubKey.x), BigInt(me.pubKey.y)];
    const account = me.account as Hex;
    
    return { account, publicKey };
  }

  private async _createInitCode(publicKey: [bigint, bigint]): Promise<{ initCode: Hex }> {
    const initCode = encodePacked(
      ["address", "bytes"],
      [
        process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex,
        encodeFunctionData({
          abi: FACTORY_ABI,
          functionName: "createAccount",
          args: [[
            toHex(publicKey[0], { size: 32 }),
            toHex(publicKey[1], { size: 32 }),
          ]],
        }),
      ]
    );
    return { initCode };
  }

  private async _getNonce(account: Hex): Promise<bigint> {
    const entryPoint = getContract({
      address: this.entryPoint,
      abi: ENTRYPOINT_ABI,
      client: this.publicClient,
    });
    return await entryPoint.read.getNonce([account, 0n]);
  }

  private _addCallData(calls: Call[]): Hex {
    // SimpleAccount expects executeBatch(Call[] calldata calls).
    const callTuples = calls.map((c) => [c.dest, c.value, c.data] as [Hex, bigint, Hex]);
    return encodeFunctionData({
      abi: parseAbi(["function executeBatch((address,uint256,bytes)[] calldata calls) external"]),
      functionName: "executeBatch",
      args: [callTuples],
    });
  }
}
