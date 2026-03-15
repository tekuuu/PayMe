import crypto from "crypto";
import { Hex, toHex } from "viem";
import cbor from "cbor";
import { parseAuthenticatorData } from "@simplewebauthn/server/helpers";
import { AsnParser } from "@peculiar/asn1-schema";
import { ECDSASigValue } from "@peculiar/asn1-ecc";
import { concatUint8Arrays } from "@/lib/utils/arrayConcat";
import { CreateCredential, P256Credential, P256Signature } from "@/lib/web-authn/types";
import { shouldRemoveLeadingZero } from "@/lib/utils/removeLeadingZero";
import { startRegistration } from "@simplewebauthn/browser";
import { generateRegistrationOptions } from "@simplewebauthn/server";

export * from "@/lib/web-authn/types";

export class WebAuthn {
  private static _generateRandomBytes(): Buffer {
    return crypto.randomBytes(16);
  }

  public static isSupportedByBrowser(): boolean {
    console.log(
      "isSupportedByBrowser",
      window?.PublicKeyCredential !== undefined && typeof window.PublicKeyCredential === "function",
    );
    return (
      window?.PublicKeyCredential !== undefined && typeof window.PublicKeyCredential === "function"
    );
  }

  public static async platformAuthenticatorIsAvailable(): Promise<boolean> {
    if (
      !this.isSupportedByBrowser() &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== "function"
    ) {
      return false;
    }
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }

  public static async isConditionalSupported(): Promise<boolean> {
    if (
      !this.isSupportedByBrowser() &&
      typeof window.PublicKeyCredential.isConditionalMediationAvailable !== "function"
    ) {
      return false;
    }
    return await PublicKeyCredential.isConditionalMediationAvailable();
  }

  public static async isConditional() {
    if (
      typeof window.PublicKeyCredential !== "undefined" &&
      typeof window.PublicKeyCredential.isConditionalMediationAvailable === "function"
    ) {
      const available = await PublicKeyCredential.isConditionalMediationAvailable();

      if (available) {
        this.get();
      }
    }
  }

  public static async create({ username }: { username: string }): Promise<CreateCredential | null> {
    this.isSupportedByBrowser();

    const options: PublicKeyCredentialCreationOptions = {
      timeout: 60000,
      rp: {
        name: "passkeys-4337/smart-wallet",
        id: window.location.hostname,
      },
      user: {
        id: this._generateRandomBytes(),
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, // ES256
      ],
      authenticatorSelection: {
        requireResidentKey: true,
        userVerification: "required",
        authenticatorAttachment: "platform",
      },
      attestation: "direct",
      challenge: Uint8Array.from("random-challenge", (c) => c.charCodeAt(0)),
    };

    const credential = await navigator.credentials.create({
      publicKey: options,
    });

    if (!credential) {
      return null;
    }

    let cred = credential as unknown as {
      rawId: ArrayBuffer;
      response: {
        clientDataJSON: ArrayBuffer;
        attestationObject: ArrayBuffer;
      };
    };

    // decode attestation object and get public key
    const decodedAttestationObj = cbor.decode(cred.response.attestationObject);
    const authData = parseAuthenticatorData(decodedAttestationObj.authData);
    const publicKey = cbor.decode(authData?.credentialPublicKey?.buffer as ArrayBuffer);
    const x = toHex(publicKey.get(-2));
    const y = toHex(publicKey.get(-3));

    // SAVE PUBKEY TO FACTORY
    return {
      rawId: toHex(new Uint8Array(cred.rawId)),
      pubKey: {
        x,
        y,
      },
    };
  }

  public static async get(challenge?: Hex): Promise<P256Credential | null> {
    this.isSupportedByBrowser();

    const options: PublicKeyCredentialRequestOptions = {
      timeout: 60000,
      challenge: challenge
        ? Buffer.from(challenge.slice(2), "hex")
        : Uint8Array.from("random-challenge", (c) => c.charCodeAt(0)),
      rpId: window.location.hostname,
      userVerification: "preferred",
    } as PublicKeyCredentialRequestOptions;

    const credential = await window.navigator.credentials.get({
      publicKey: options,
    });

    if (!credential) {
      return null;
    }

    let cred = credential as unknown as {
      rawId: ArrayBuffer;
      response: {
        clientDataJSON: ArrayBuffer;
        authenticatorData: ArrayBuffer;
        signature: ArrayBuffer;
        userHandle: ArrayBuffer;
      };
    };

    const utf8Decoder = new TextDecoder("utf-8");

    const decodedClientData = utf8Decoder.decode(cred.response.clientDataJSON);
    const clientDataObj = JSON.parse(decodedClientData);

    let authenticatorData = toHex(new Uint8Array(cred.response.authenticatorData));
    let signature = parseSignature(new Uint8Array(cred?.response?.signature));

    return {
      rawId: toHex(new Uint8Array(cred.rawId)),
      rawClientDataJSON: decodedClientData, // exact original bytes — needed for signature verification
      clientData: {
        type: clientDataObj.type,
        challenge: clientDataObj.challenge,
        origin: clientDataObj.origin,
        crossOrigin: clientDataObj.crossOrigin,
      },
      authenticatorData,
      signature,
    };
  }
}

// Parse the signature from the authenticator and remove the leading zero if necessary
export function parseSignature(signature: Uint8Array): P256Signature {
  const parsedSig = AsnParser.parse(signature, ECDSASigValue);

  // R and S should be 32 bytes each. ASN.1 parsing might return them with 
  // leading zeros if they are positive and have the MSB set.
  // We need to exactly pad or slice them to 32 bytes.
  const formatComponent = (bytes: ArrayBuffer): Hex => {
    let uint8 = new Uint8Array(bytes);
    if (uint8.length > 32) {
      uint8 = uint8.slice(uint8.length - 32);
    }
    const hex = toHex(uint8).slice(2).padStart(64, "0");
    return `0x${hex}`;
  };

  return {
    r: formatComponent(parsedSig.r),
    s: formatComponent(parsedSig.s),
  };
}
