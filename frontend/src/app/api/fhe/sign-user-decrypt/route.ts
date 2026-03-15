import { NextRequest, NextResponse } from "next/server";
import { Wallet } from "ethers";
import { Hex } from "viem";

type SignBody = {
  domain: Record<string, unknown>;
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message: Record<string, unknown>;
};

const USER_DECRYPT_FIELDS = [
  "publicKey",
  "contractAddresses",
  "startTimestamp",
  "durationDays",
  "extraData",
];

function getDecryptSigner() {
  const pk = process.env.RELAYER_PRIVATE_KEY as Hex | undefined;
  if (!pk) {
    throw new Error("RELAYER_PRIVATE_KEY is not configured");
  }
  return new Wallet(pk);
}

export async function GET() {
  try {
    const account = getDecryptSigner();
    return NextResponse.json({ address: account.address });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Decrypt signer unavailable" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SignBody;
    const { domain, types, primaryType, message } = body || {};

    if (primaryType !== "UserDecryptRequestVerification") {
      return NextResponse.json({ error: "Unsupported primaryType" }, { status: 400 });
    }

    if (!types || !Array.isArray(types.UserDecryptRequestVerification)) {
      return NextResponse.json({ error: "Invalid typed data types" }, { status: 400 });
    }

    const fields = types.UserDecryptRequestVerification.map((f) => f?.name);
    const hasAllFields = USER_DECRYPT_FIELDS.every((name) => fields.includes(name));
    if (!hasAllFields) {
      return NextResponse.json({ error: "Unexpected UserDecryptRequestVerification fields" }, { status: 400 });
    }

    if (!message || typeof message !== "object") {
      return NextResponse.json({ error: "Missing typed data message" }, { status: 400 });
    }

    const signer = getDecryptSigner();

    // Mirror relayer-sdk flow: sign only the primary type (domain handled separately).
    const signature = await signer.signTypedData(
      domain as any,
      {
        [primaryType]: types[primaryType],
      } as any,
      message as any,
    );

    return NextResponse.json({ signature, address: signer.address });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to sign user decrypt payload" },
      { status: 500 },
    );
  }
}
