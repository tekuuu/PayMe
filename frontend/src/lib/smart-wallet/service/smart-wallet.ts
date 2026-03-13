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
import { CHAIN } from "@/config/constants";
import { EstimateUserOperationGasReturnType } from "@/lib/smart-wallet/service/actions";
import { Hex, encodePacked, encodeAbiParameters } from "viem";
import { P256Credential, WebAuthn } from "@/lib/web-authn/web-authn";

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

  constructor() {
    this._client = createSmartWalletClient({
      chain: CHAIN,
      transport,
    });
  }

  public init() {
    this._isInitiated = true;
  }

  public get client() {
    console.warn(
      "smartWallet: isInit() is not called. Only use this getter if you want to access wagmi publicClient method.",
    );
    return this._client;
  }

  public async sendUserOperation(args: { userOp: UserOperationAsHex }): Promise<`0x${string}`> {
    this._isInit();
    return await this._client.sendUserOperation({
      ...args,
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

  public async getUserOperationReceipt(args: { hash: Hash }): Promise<`0x${string}`> {
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
              clientDataJSON: JSON.stringify(credentials.clientData).replace(/ /g, ""),
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

  private _isInit() {
    if (this._isInitiated) {
      return true;
    } else {
      throw new Error("SmartWallet is not initialized");
    }
  }
}

export const smartWallet = new SmartWallet();
