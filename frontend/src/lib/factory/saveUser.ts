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

  const res: Omit<User, "balance"> = await response.json();

  // Force a tiny delay to allow RPC nodes to catch up on the backend before the frontend starts polling
  await new Promise((resolve) => setTimeout(resolve, 500));

  return res;
}
