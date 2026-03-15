import {
  Chain,
  GetContractReturnType,
  Hex,
  PublicClient,
  WalletClient,
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  encodePacked,
  getContract,
  http,
  parseAbi,
  toHex,
  encodeAbiParameters,
  Address,
  zeroAddress,
} from "viem";
import { UserOperationAsHex, UserOperation, Call } from "@/lib/smart-wallet/service/userOps/types";
import { DEFAULT_USER_OP } from "@/lib/smart-wallet/service/userOps/constants";
import { P256Credential, WebAuthn } from "@/lib/web-authn/web-authn";
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
    // Use the standard public RPC for contract reads (eth_call, eth_getCode, eth_estimateGas).
    // Pimlico is bundler-only and does NOT support these standard methods.
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
      "https://ethereum-sepolia-rpc.publicnode.com";

    this.publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    const walletClient = createWalletClient({
      account: this.relayer,
      chain,
      transport: http(rpcUrl),
    });

    this.factoryContract = getContract({
      address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex, // only on Sepolia
      abi: FACTORY_ABI,
      client: this.publicClient,
    });
  }

  // reference: https://ethereum.stackexchange.com/questions/150796/how-to-create-a-raw-erc-4337-useroperation-from-scratch-and-then-send-it-to-bund
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
    // Ensure bundler client methods are available even if caller forgot to init.
    smartWallet.init();

    // 0. Resolve gas prices if not provided
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
    // calculate smart wallet address via Factory contract to know the sender
    const { account, publicKey } = await this._calculateSmartWalletAddress(keyId); // the keyId is the id tied to the user's public key

    // get bytecode
    const bytecode = await this.publicClient.getBytecode({
      address: account,
    });

    let initCode = toHex(new Uint8Array(0));
    let initCodeGas = BigInt(0);
    if (bytecode === undefined) {
      // smart wallet does NOT already exists
      // calculate initCode and initCodeGas
      ({ initCode, initCodeGas } = await this._createInitCode(publicKey));
    }

    // calculate nonce (or use caller-provided nonce to avoid cross-RPC lag issues)
    const resolvedNonce = nonce ?? (await this._getNonce(account));

    // create callData
    const callData = this._addCallData(calls);

    // create user operation
    const userOp: UserOperation = {
      ...DEFAULT_USER_OP,
      sender: account,
      nonce: resolvedNonce,
      initCode,
      callData,
      maxFeePerGas: resolvedMaxFeePerGas!,
      maxPriorityFeePerGas: resolvedMaxPriorityFeePerGas!,
    };

    // estimate gas for this partial user operation
    // real good article about the subject can be found here:
    // https://www.alchemy.com/blog/erc-4337-gas-estimation
    let callGasLimit: Hex;
    let verificationGasLimit: Hex;
    let preVerificationGas: Hex;

    try {
      ({ callGasLimit, verificationGasLimit, preVerificationGas } =
        await smartWallet.estimateUserOperationGas({
          userOp: this.toParams(userOp),
        }));
    } catch (error: any) {
      const estimateMessage = error?.message || "";
      if (typeof estimateMessage === "string" && estimateMessage.includes("AA21")) {
        throw new Error("Smart wallet has insufficient ETH for user-op prefund (AA21). Please top up ETH and retry.");
      }

      // Retry once with larger placeholders for bundlers that are strict during simulation.
      userOp.callGasLimit = BigInt(2_000_000);
      userOp.verificationGasLimit = BigInt(2_000_000);
      userOp.preVerificationGas = BigInt(200_000);

      ({ callGasLimit, verificationGasLimit, preVerificationGas } =
        await smartWallet.estimateUserOperationGas({
          userOp: this.toParams(userOp),
        }));
    }

    // set gas limits with buffered values
    userOp.callGasLimit = BigInt(callGasLimit);
    // preVerificationGas from simulation is often low because final signature payload is added later.
    // Add both a percentage and fixed buffer to avoid "preVerificationGas is not enough" rejections.
    const estimatedPreVerificationGas = BigInt(preVerificationGas);
    const bufferedPreVerificationGas = (estimatedPreVerificationGas * BigInt(12)) / BigInt(10) + BigInt(25_000);
    const MINIMUM_PRE_VERIFICATION_GAS = BigInt(65_000);
    userOp.preVerificationGas =
      bufferedPreVerificationGas > MINIMUM_PRE_VERIFICATION_GAS
        ? bufferedPreVerificationGas
        : MINIMUM_PRE_VERIFICATION_GAS;
    // P256/WebAuthn (secp256r1) verification costs 300k-350k gas on EVM without RIP-7212 precompile.
    // The bundler estimates with a dummy zero-signature so the on-chain sig check is skipped.
    // We must add a large buffer to cover the real signature verification cost.
    const estimatedVerification = BigInt(verificationGasLimit) + BigInt(initCodeGas);
    const withBuffer = estimatedVerification + BigInt(400_000);
    const MINIMUM_VERIFICATION_GAS = BigInt(500_000);
    userOp.verificationGasLimit = withBuffer > MINIMUM_VERIFICATION_GAS ? withBuffer : MINIMUM_VERIFICATION_GAS;

    // get userOp hash (with signature == 0x) by calling the entry point contract
    const userOpHash = await this._getUserOpHash(userOp);

    // RESTORE: The contract expects a packed message including version and timing, not just the hash
    const msgToSign = encodePacked(["uint8", "uint48", "bytes32"], [1, 0, userOpHash]);

    // get signature from webauthn
    const signature = await this.getSignature(msgToSign, keyId);

    return this.toParams({ ...userOp, signature });
  }

  public toParams(op: UserOperation): UserOperationAsHex {
    return {
      sender: op.sender,
      nonce: toHex(op.nonce),
      initCode: op.initCode,
      callData: op.callData,
      callGasLimit: toHex(op.callGasLimit),
      verificationGasLimit: toHex(op.verificationGasLimit),
      preVerificationGas: toHex(op.preVerificationGas),
      maxFeePerGas: toHex(op.maxFeePerGas),
      maxPriorityFeePerGas: toHex(op.maxPriorityFeePerGas),
      paymasterAndData: op.paymasterAndData === zeroAddress ? "0x" : op.paymasterAndData,
      signature: op.signature,
    };
  }

  public async getSignature(msgToSign: Hex, keyId: Hex): Promise<Hex> {
    const credentials: P256Credential = (await WebAuthn.get(msgToSign)) as P256Credential;

    if (credentials.rawId !== keyId) {
      throw new Error(
        "Incorrect passkeys used for tx signing. Please sign the transaction with the correct logged-in account",
      );
    }

    const signature = encodePacked(
      ["uint8", "uint48", "bytes"],
      [
        1,
        0,
        encodeAbiParameters(
          [
            {
              type: "tuple",
              name: "credentials",
              components: [
                {
                  name: "authenticatorData",
                  type: "bytes",
                },
                {
                  name: "clientDataJSON",
                  type: "string",
                },
                {
                  name: "challengeLocation",
                  type: "uint256",
                },
                {
                  name: "responseTypeLocation",
                  type: "uint256",
                },
                {
                  name: "r",
                  type: "uint256",
                },
                {
                  name: "s",
                  type: "uint256",
                },
              ],
            },
          ],
          [
            {
              authenticatorData: credentials.authenticatorData,
              clientDataJSON: credentials.rawClientDataJSON,
              challengeLocation: BigInt(23),
              responseTypeLocation: BigInt(1),
              r: BigInt(credentials.signature.r),
              s: BigInt(credentials.signature.s),
            },
          ],
        ),
      ],
    );

    return signature;
  }

  public async getSenderAddress(keyId: Hex): Promise<Address> {
    const { account } = await this._calculateSmartWalletAddress(keyId);
    return account;
  }

  private async _createInitCode(
    pubKey: readonly [Hex, Hex],
  ): Promise<{ initCode: Hex; initCodeGas: bigint }> {
    let createAccountTx = encodeFunctionData({
      abi: FACTORY_ABI,
      functionName: "createAccount",
      args: [pubKey],
    });

    let initCode = encodePacked(
      ["address", "bytes"], // types
      [this.factoryContract.address, createAccountTx], // values
    );

    let initCodeGas = await this.publicClient.estimateGas({
      account: this.relayer,
      to: this.factoryContract.address,
      data: createAccountTx,
    });

    return {
      initCode,
      initCodeGas,
    };
  }

  private async _calculateSmartWalletAddress(
    id: Hex,
  ): Promise<{ account: Address; publicKey: readonly [Hex, Hex] }> {
    const user = await this.factoryContract.read.getUser([BigInt(id)]);
    return { account: user.account, publicKey: user.publicKey };
  }

  private _addCallData(calls: Call[]): Hex {
    return encodeFunctionData({
      abi: [
        {
          inputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "dest",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes",
                },
              ],
              internalType: "struct Call[]",
              name: "calls",
              type: "tuple[]",
            },
          ],
          name: "executeBatch",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      functionName: "executeBatch",
      args: [calls],
    });
  }

  private async _getNonce(smartWalletAddress: Hex): Promise<bigint> {
    const nonce: bigint = await this.publicClient.readContract({
      address: this.entryPoint,
      abi: parseAbi(["function getNonce(address, uint192) view returns (uint256)"]),
      functionName: "getNonce",
      args: [smartWalletAddress, BigInt(0)],
    });
    return nonce;
  }

  private async _getUserOpHash(userOp: UserOperation): Promise<Hex> {
    const userOpHash = await this.publicClient.readContract({
      address: this.entryPoint,
      abi: ENTRYPOINT_ABI,
      functionName: "getUserOpHash",
      args: [this.toParams(userOp)],
    });
    return userOpHash;
  }
}
