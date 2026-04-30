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
import { DEFAULT_USER_OP } from "./constants";

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

  private _toBigInt(value: unknown): bigint | undefined {
    if (typeof value === "bigint") return value;
    if (typeof value === "number" && Number.isFinite(value)) return BigInt(Math.trunc(value));
    if (typeof value === "string" && value.length > 0) {
      try {
        return BigInt(value);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  private _normalizeGasQuote(quote: unknown): {
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
  } {
    if (!quote || typeof quote !== "object") {
      return {};
    }

    const candidate = quote as Record<string, unknown>;
    const directMaxFee = this._toBigInt(candidate.maxFeePerGas);
    const directPriority = this._toBigInt(candidate.maxPriorityFeePerGas);

    if (directMaxFee !== undefined || directPriority !== undefined) {
      return {
        maxFeePerGas: directMaxFee,
        maxPriorityFeePerGas: directPriority,
      };
    }

    for (const tier of [candidate.fast, candidate.standard, candidate.slow]) {
      const normalizedTier = this._normalizeGasQuote(tier);
      if (
        normalizedTier.maxFeePerGas !== undefined ||
        normalizedTier.maxPriorityFeePerGas !== undefined
      ) {
        return normalizedTier;
      }
    }

    const gasPrice = this._toBigInt(candidate.gasPrice);
    if (gasPrice !== undefined) {
      return {
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: gasPrice / 2n,
      };
    }

    return {};
  }

  private _applyGasBuffer(value: bigint): bigint {
    if (value <= 0n) return 0n;
    const bufferBps = 2500n;
    return (value * (10_000n + bufferBps) + 9_999n) / 10_000n;
  }

  private _maxBigInt(values: Array<bigint | undefined>): bigint {
    let best = 0n;
    for (const value of values) {
      if (value !== undefined && value > best) {
        best = value;
      }
    }
    return best;
  }

  private async _resolveUserOpFees(input: {
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
  }): Promise<{ maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }> {
    const bundlerQuote = await (async () => {
      try {
        const rawQuote = await smartWallet.client.request({
          method: "pimlico_getUserOperationGasPrice" as any,
          params: [] as any,
        } as any);

        return this._normalizeGasQuote(rawQuote);
      } catch {
        return {};
      }
    })();

    const fees = await this.publicClient.estimateFeesPerGas().catch(
      () => ({} as { maxFeePerGas?: bigint; maxPriorityFeePerGas?: bigint }),
    );
    const networkGasPrice = await this.publicClient.getGasPrice().catch(() => 0n);

    const prioritySource =
      input.maxPriorityFeePerGas ??
      bundlerQuote.maxPriorityFeePerGas ??
      fees.maxPriorityFeePerGas ??
      (networkGasPrice > 0n ? networkGasPrice / 2n : DEFAULT_USER_OP.maxPriorityFeePerGas);

    const feeSource =
      input.maxFeePerGas ??
      bundlerQuote.maxFeePerGas ??
      fees.maxFeePerGas ??
      (networkGasPrice > 0n ? networkGasPrice : prioritySource);

    const maxPriorityFeePerGas = this._maxBigInt([
      this._applyGasBuffer(prioritySource),
      DEFAULT_USER_OP.maxPriorityFeePerGas,
    ]);

    const maxFeePerGas = this._maxBigInt([
      this._applyGasBuffer(feeSource),
      maxPriorityFeePerGas,
      DEFAULT_USER_OP.maxFeePerGas,
    ]);

    return { maxFeePerGas, maxPriorityFeePerGas };
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

    const { maxFeePerGas: resolvedMaxFeePerGas, maxPriorityFeePerGas: resolvedMaxPriorityFeePerGas } =
      await this._resolveUserOpFees({
        maxFeePerGas,
        maxPriorityFeePerGas,
      });

    const { account, publicKey: resolvedPublicKey } = await this._resolveSmartWalletIdentity({
      keyId,
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

    const hasInitCode = initCode !== "0x" && initCode !== "0x0";
    // WebAuthn signature validation can be significantly under-estimated by some bundlers.
    // Keep sane floors so validateUserOp does not OOG with AA23.
    // Decrypt (FHE) & Subscription approvals require massive verification overhead.
    const MIN_CALL_GAS_LIMIT = hasInitCode ? 500_000n : 350_000n;
    const MIN_VERIFICATION_GAS_LIMIT = hasInitCode ? 1_800_000n : 1_500_000n;
    const MIN_PRE_VERIFICATION_GAS = hasInitCode ? 350_000n : 280_000n;

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
      // Relayer user-decrypt/AA expects a specific format for WebAuthn signatures.
      // Larger dummy to force more room for clientDataJson variability (typical for subscription flows).
      const dummySignature = (`0x${"11".repeat(2000)}`) as Hex;
      const gasEstimate = await smartWallet.estimateUserOperationGas({
        userOp: {
          ...partialOp,
          signature: dummySignature,
        } as any,
      });

      const call = BigInt(gasEstimate.callGasLimit);
      const verification = BigInt(gasEstimate.verificationGasLimit);
      const pre = BigInt(gasEstimate.preVerificationGas);

      // Keep margins extreme; subscription approvals are high-overhead FHE operations.
      const callGasLimit = maxBigInt([
        withCeilMargin(call, 5000n) + 200_000n, // +50% + 200k
        MIN_CALL_GAS_LIMIT,
      ]);
      const verificationGasLimit = maxBigInt([
        withCeilMargin(verification, 6000n) + 400_000n, // +60% + 400k
        MIN_VERIFICATION_GAS_LIMIT,
      ]);
      const preVerificationGas = maxBigInt([
        withCeilMargin(pre, 10_000n) + 100_000n, // +100% + 100k
        MIN_PRE_VERIFICATION_GAS,
      ]);

      return {
        ...partialOp,
        callGasLimit: toHex(callGasLimit),
        verificationGasLimit: toHex(verificationGasLimit),
        preVerificationGas: toHex(preVerificationGas),
      };
    } catch {
      // Moderate defaults (avoid exploding prefund). If these still fail, we'll need a paymaster
      // or a more explicit funding flow.
      return {
        ...partialOp,
        callGasLimit: toHex(1_300_000n),
        verificationGasLimit: toHex(1_800_000n),
        preVerificationGas: toHex(650_000n),
      };
    }
  }

  async getSenderAddress(keyId: Hex): Promise<Hex> {
    const { account } = await this._resolveSmartWalletIdentity({ keyId });
    return account;
  }

  private async _resolveSmartWalletIdentity(input: {
    keyId?: Hex;
    sender?: Hex;
    publicKey?: [bigint, bigint];
  }): Promise<{ account: Hex; publicKey: [bigint, bigint] }> {
    if (input.sender && input.publicKey) {
      return { account: input.sender, publicKey: input.publicKey };
    }

    const keyIdLower = input.keyId?.toLowerCase();
    const meStr = localStorage.getItem("passkeys4337.me");
    if (meStr) {
      try {
        const me = JSON.parse(meStr) as {
          keyId?: Hex;
          account?: Hex;
          pubKey?: { x: Hex; y: Hex };
        };
        const meKeyMatches = !keyIdLower || me.keyId?.toLowerCase() === keyIdLower;
        if (meKeyMatches && me.account && me.pubKey?.x && me.pubKey?.y) {
          return {
            account: me.account,
            publicKey: [BigInt(me.pubKey.x), BigInt(me.pubKey.y)],
          };
        }
      } catch {
        // ignore malformed session payload and continue with on-chain lookup
      }
    }

    if (input.keyId) {
      const { getUser } = await import("@/lib/factory/getUser");
      const user = await getUser(input.keyId);
      return {
        account: user.account as Hex,
        publicKey: [BigInt(user.pubKey.x), BigInt(user.pubKey.y)],
      };
    }

    throw new Error("User session not found in localStorage");
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
