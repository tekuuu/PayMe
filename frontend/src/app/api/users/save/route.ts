import { CHAIN, PUBLIC_CLIENT, transport } from "@/config/constants";
import { FACTORY_ABI } from "@/config/constants/factory";
import { Hex, createWalletClient, parseEther, toHex, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const TARGET_BALANCE_WEI = parseEther("0.00009");
const MIN_BALANCE_WEI = TARGET_BALANCE_WEI;

export async function POST(req: Request) {
  const { id, pubKey } = (await req.json()) as { id: Hex; pubKey: [Hex, Hex] };

  const account = privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY as Hex);
  const walletClient = createWalletClient({
    account,
    chain: CHAIN,
    transport,
  });

  const user = await PUBLIC_CLIENT.readContract({
    address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex,
    abi: FACTORY_ABI,
    functionName: "getUser",
    args: [BigInt(id)],
  });

  if (user.account !== zeroAddress) {
    const currentBalance = await PUBLIC_CLIENT.getBalance({ address: user.account });
    if (currentBalance < MIN_BALANCE_WEI) {
      const topUpAmount = TARGET_BALANCE_WEI - currentBalance;
      await walletClient.sendTransaction({
        to: user.account,
        value: topUpAmount,
      });
    }

    return Response.json({
      id,
      account: user.account,
      pubKey: user.publicKey,
    });
  }

  await walletClient.writeContract({
    address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex,
    abi: FACTORY_ABI,
    functionName: "saveUser",
    args: [BigInt(id), pubKey],
  });

  const smartWalletAddress = await PUBLIC_CLIENT.readContract({
    address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex,
    abi: FACTORY_ABI,
    functionName: "getAddress",
    args: [pubKey],
  });

  await walletClient.sendTransaction({
    to: smartWalletAddress,
    value: TARGET_BALANCE_WEI,
  });

  const createdUser = {
    id,
    account: smartWalletAddress,
    pubKey,
  };

  return Response.json(createdUser);
}
