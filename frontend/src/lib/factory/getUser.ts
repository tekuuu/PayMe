import { Address, Hex } from "viem";

export type User = { id: Hex; pubKey: { x: Hex; y: Hex }; account: Address; balance: bigint };

export async function getUser(id: Hex): Promise<User> {
  const response = await fetch(`/api/users/${id}`, {
    method: "GET",
  });

  const raw = await response.text();
  let user: any = null;
  try {
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }

  if (!response.ok || (user && typeof user === "object" && user.error)) {
    throw new Error((user && user.error) || `Failed to fetch user (HTTP ${response.status}).`);
  }

  if (!user || typeof user !== "object") {
    throw new Error("Failed to fetch user: server returned an empty response.");
  }

  return {
    id: user.id,
    pubKey: {
      x: user.publicKey[0],
      y: user.publicKey[1],
    },
    account: user.account,
    balance: user.balance,
  };
}
