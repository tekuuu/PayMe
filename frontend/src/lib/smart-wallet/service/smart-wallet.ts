import {
  Client,
  Chain,
  Transport,
  Hash,
  Account,
  PublicClientConfig,
  PublicClient,
  createPublicClient,
} from "viem";
import { SmartWalletActions, smartWalletActions } from "./decorators";
import { transport } from "../config";
import { ERC4337RpcSchema, UserOperationAsHex } from "@/lib/smart-wallet/service/userOps";
import { CHAIN, ENTRYPOINT_ABI, ENTRYPOINT_ADDRESS } from "@/config/constants";
import { EstimateUserOperationGasReturnType } from "@/lib/smart-wallet/service/actions";
import { Hex, encodePacked, encodeAbiParameters, getContract, http, Address } from "viem";
import { WebAuthn } from "@/lib/web-authn/web-authn";

export type SmartWalletClient<chain extends Chain | undefined = Chain | undefined> = Client<
  Transport,
  chain,
  Account | undefined,
  ERC4337RpcSchema,
  SmartWalletActions
> &
  PublicClient;

export const createSmartWalletClient = (parameters: PublicClientConfig): SmartWalletClient => {
  const { key = "public", name = "Smart Wallet Client" } = parameters;
  const client = createPublicClient({
    ...parameters,
    key,
    name,
  });
  return client.extend(smartWalletActions);
};

class SmartWallet {
  private _client: SmartWalletClient;
  private _isInitiated: boolean = false;
  private _publicClient: PublicClient;

  constructor() {
    this._client = createSmartWalletClient({
      chain: CHAIN,
      transport,
    });
    
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://ethereum-sepolia-rpc.publicnode.com";
    this._publicClient = createPublicClient({
      chain: CHAIN,
      transport: http(rpcUrl),
    });
  }

  public init() {
    this._isInitiated = true;
  }

  public get client() {
    return this._client;
  }

  private _isInit() {
    if (!this._isInitiated) {
      throw new Error("Smart Wallet Client not initiated");
    }
  }

  private async _assertNetworkConsistency(): Promise<void> {
    const [bundlerChainIdHex, publicChainId] = await Promise.all([
      this._client.request({ method: "eth_chainId" as any, params: [] as any }) as Promise<Hex>,
      this._publicClient.getChainId(),
    ]);

    const bundlerChainId = Number(BigInt(bundlerChainIdHex));
    if (bundlerChainId !== publicChainId) {
      throw new Error(
        `Network mismatch: NEXT_PUBLIC_BUNDLER_URL chainId (${bundlerChainId}) ` +
          `!= NEXT_PUBLIC_RPC_ENDPOINT chainId (${publicChainId}). ` +
          "Set both URLs to the same chain before sending transactions."
      );
    }
  }

  public async sendUserOperation(args: { userOp: UserOperationAsHex }): Promise<Hash> {
    this._isInit();
    await this._assertNetworkConsistency();

    const entryPoint = getContract({
      address: ENTRYPOINT_ADDRESS,
      abi: ENTRYPOINT_ABI,
      client: this._publicClient,
    });

    const userOpForHash = {
      sender: args.userOp.sender as Address,
      nonce: BigInt(args.userOp.nonce),
      initCode: args.userOp.initCode as Hex,
      callData: args.userOp.callData as Hex,
      callGasLimit: BigInt(args.userOp.callGasLimit),
      verificationGasLimit: BigInt(args.userOp.verificationGasLimit),
      preVerificationGas: BigInt(args.userOp.preVerificationGas),
      maxFeePerGas: BigInt(args.userOp.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(args.userOp.maxPriorityFeePerGas),
      paymasterAndData: args.userOp.paymasterAndData as Hex,
      signature: "0x" as Hex,
    };

    const userOpHash = await entryPoint.read.getUserOpHash([userOpForHash]);

    // The contract verification actually packs the version (1) and validUntil (0)
    // with the userOpHash before verifying the signature. We MUST sign this packed message.
    const messageToVerify = encodePacked(
      ["uint8", "uint48", "bytes32"],
      [1, 0, userOpHash as Hex]
    );

    const signature = await this.getSignature(messageToVerify);

    return await this._client.sendUserOperation({
      userOp: {
        ...args.userOp,
        signature,
      },
    });
  }

  public async estimateUserOperationGas(args: {
    userOp: UserOperationAsHex;
  }): Promise<EstimateUserOperationGasReturnType> {
    this._isInit();
    return await this._client.estimateUserOperationGas({
      ...args,
    });
  }

  public async getUserOperationReceipt(args: { hash: Hash }): Promise<any> {
    this._isInit();
    return await this._client.getUserOperationReceipt({
      ...args,
    });
  }

  public async getIsValidSignature(args: any): Promise<boolean> {
    this._isInit();
    return await this._client.getIsValidSignature({
      ...args,
    });
  }

  public async waitForUserOperationReceipt(args: any): Promise<any> {
    this._isInit();
    return await this._client.waitForUserOperationReceipt({
      ...args,
    });
  }

  public async getSignature(msgToSign: Hex): Promise<Hex> {
    const credentials = (await WebAuthn.get(msgToSign)) as any;

    // Use exactly the raw original client data JSON string returned by the authenticator
    const clientDataJSON = credentials.rawClientDataJSON as string;
    
    // Find the exact byte offset indices inside the raw JSON string
    // This perfectly aligns with how `WebAuthn.sol` uses the `contains` method on-chain
    const challengePos = clientDataJSON.indexOf('"challenge":"');
    const typePos = clientDataJSON.indexOf('"type":"webauthn.get"');

    if (challengePos === -1 || typePos === -1) {
      throw new Error("Invalid clientDataJSON: missing challenge or type");
    }

    return encodePacked(
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
                { name: "authenticatorData", type: "bytes" },
                { name: "clientDataJSON", type: "string" },
                { name: "challengeLocation", type: "uint256" },
                { name: "responseTypeLocation", type: "uint256" },
                { name: "r", type: "uint256" },
                { name: "s", type: "uint256" },
              ],
            },
          ],
          [
            {
              authenticatorData: credentials.authenticatorData as Hex,
              clientDataJSON: clientDataJSON,
              // WebAuthn.sol checks for the full `"challenge":"<base64url>"` property,
              // so this index must point at the property start, not the value start.
              challengeLocation: BigInt(challengePos),
              responseTypeLocation: BigInt(typePos),
              r: BigInt(credentials.signature.r),
              s: BigInt(credentials.signature.s),
            },
          ]
        ),
      ]
    );
  }
}

export const smartWallet = new SmartWallet();
