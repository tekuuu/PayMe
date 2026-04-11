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
    sender,
    publicKey,
  }: {
    calls: Call[];
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
    keyId: Hex;
    nonce?: bigint;
    sender?: Hex;
    publicKey?: [bigint, bigint];
  }): Promise<UserOperationAsHex> {
    smartWallet.init();

    let resolvedMaxFeePerGas = maxFeePerGas;
    let resolvedMaxPriorityFeePerGas = maxPriorityFeePerGas;

    if (!resolvedMaxFeePerGas || !resolvedMaxPriorityFeePerGas) {
      // Prefer chain fee estimates. Pimlico's "fast" quotes can be much higher than needed,
      // which increases the required prefund and can break fresh-account flows.
      const fees = await this.publicClient.estimateFeesPerGas();
      resolvedMaxFeePerGas = resolvedMaxFeePerGas ?? fees.maxFeePerGas ?? 0n;
      resolvedMaxPriorityFeePerGas = resolvedMaxPriorityFeePerGas ?? fees.maxPriorityFeePerGas ?? 0n;

      // Best-effort cap using bundler quotes (if available) to avoid underpricing,
      // without letting an aggressive quote explode prefund requirements.
      try {
        const gasPrice = await smartWallet.client.request({
          method: "pimlico_getUserOperationGasPrice" as never,
        } as never);
        const pimlicoMax = BigInt((gasPrice as any).fast.maxFeePerGas);
        const pimlicoTip = BigInt((gasPrice as any).fast.maxPriorityFeePerGas);

        // Cap at 2x the chain estimate (still plenty for sepolia volatility).
        const capMax = resolvedMaxFeePerGas * 2n;
        const capTip = resolvedMaxPriorityFeePerGas * 2n;
        resolvedMaxFeePerGas = pimlicoMax < capMax ? pimlicoMax : capMax;
        resolvedMaxPriorityFeePerGas = pimlicoTip < capTip ? pimlicoTip : capTip;
      } catch {
        // ignore
      }
    }

    const { account, publicKey: resolvedPublicKey } = await this._resolveSmartWalletIdentity({
      sender,
      publicKey,
    });

    const bytecode = await this.publicClient.getBytecode({
      address: account,
    });

    let initCode = toHex(new Uint8Array(0));
    if (!bytecode || bytecode === "0x" || bytecode === "0x0") {
      ({ initCode } = await this._createInitCode(resolvedPublicKey));
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

    const withCeilMargin = (value: bigint, bps: bigint) => {
      if (value <= 0n) return 0n;
      // ceil(value * (1 + bps/10_000))
      return (value * (10_000n + bps) + 9_999n) / 10_000n;
    };

    const maxBigInt = (values: bigint[]) => {
      let best = values[0] ?? 0n;
      for (const value of values) {
        if (value > best) best = value;
      }
      return best;
    };

    try {
      // Estimating with empty signature underestimates preVerificationGas for WebAuthn payloads.
      // Use a realistic dummy signature size so final signed UserOps don't get rejected.
      const dummySignature = (`0x${"11".repeat(900)}`) as Hex;
      const gasEstimate = await smartWallet.estimateUserOperationGas({
        userOp: {
          ...partialOp,
          signature: dummySignature,
        } as any,
      });

      const call = BigInt(gasEstimate.callGasLimit);
      const verification = BigInt(gasEstimate.verificationGasLimit);
      const pre = BigInt(gasEstimate.preVerificationGas);

      // Keep margins moderate; too little fails, too much inflates prefund.
      const callGasLimit = withCeilMargin(call, 2000n) + 50_000n; // +20% + 50k
      const verificationGasLimit = withCeilMargin(verification, 2000n) + 100_000n; // +20% + 100k
      const preVerificationGas = maxBigInt([
        withCeilMargin(pre, 3000n) + 15_000n, // +30% + 15k
        80_000n, // floor for passkey-heavy payloads
      ]);

      return {
        ...partialOp,
        callGasLimit: toHex(callGasLimit),
        verificationGasLimit: toHex(verificationGasLimit),
        preVerificationGas: toHex(preVerificationGas),
      };
    } catch(e) {
      console.warn("Gas estimation failed, falling back to defaults", e);

      // Moderate defaults (avoid exploding prefund). If these still fail, we'll need a paymaster
      // or a more explicit funding flow.
      return {
        ...partialOp,
        callGasLimit: toHex(1_500_000n),
        verificationGasLimit: toHex(1_500_000n),
        preVerificationGas: toHex(350_000n),
      };
    }
  }

  async getSenderAddress(keyId: Hex): Promise<Hex> {
    const { account } = await this._resolveSmartWalletIdentity({});
    return account;
  }

  private async _resolveSmartWalletIdentity(input: {
    sender?: Hex;
    publicKey?: [bigint, bigint];
  }): Promise<{ account: Hex; publicKey: [bigint, bigint] }> {
    if (input.sender && input.publicKey) {
      return { account: input.sender, publicKey: input.publicKey };
    }

    const meStr = localStorage.getItem("passkeys4337.me");
    if (!meStr) {
      throw new Error("User session not found in localStorage");
    }
    
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
