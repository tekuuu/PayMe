import { Hex } from "viem";
import { User } from "./getUser";

export async function saveUser({
  id,
  pubKey,
}: {
  id: Hex;
  pubKey: { x: Hex; y: Hex };
}): Promise<Omit<User, "balance">> {
  const response = await fetch("/api/users/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, pubKey: [pubKey.x, pubKey.y] }),
  });

  const raw = await response.text();
  let parsed: any = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message =
      (parsed && typeof parsed === "object" && parsed.error) ||
      `Failed to save user (HTTP ${response.status}).`;
    throw new Error(message);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Failed to save user: server returned an empty response.");
  }

  const res: Omit<User, "balance"> = parsed;

  // Force a tiny delay to allow RPC nodes to catch up on the backend before the frontend starts polling
  await new Promise((resolve) => setTimeout(resolve, 500));

  return res;
}
