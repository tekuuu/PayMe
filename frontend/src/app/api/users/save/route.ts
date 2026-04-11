import { CHAIN, PUBLIC_CLIENT, transport } from "@/config/constants";
import { FACTORY_ABI } from "@/config/constants/factory";
import { Hex, createWalletClient, parseEther, toHex, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const TARGET_BALANCE_WEI = parseEther("0.00009");
const MIN_BALANCE_WEI = TARGET_BALANCE_WEI;

export async function POST(req: Request) {
  try {
    const { id, pubKey } = (await req.json()) as { id: Hex; pubKey: [Hex, Hex] };

    const relayerPk = process.env.RELAYER_PRIVATE_KEY as Hex | undefined;
    if (!relayerPk) {
      return Response.json(
        { error: "Server misconfigured: RELAYER_PRIVATE_KEY is missing." },
        { status: 500 }
      );
    }

    const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex | undefined;
    if (!factoryAddress) {
      return Response.json(
        { error: "Server misconfigured: NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS is missing." },
        { status: 500 }
      );
    }

    const account = privateKeyToAccount(relayerPk);
    const walletClient = createWalletClient({
      account,
      chain: CHAIN,
      transport,
    });

    const user = await PUBLIC_CLIENT.readContract({
      address: factoryAddress,
      abi: FACTORY_ABI,
      functionName: "getUser",
      args: [BigInt(id)],
    });

    if (user.account !== zeroAddress) {
      const currentBalance = await PUBLIC_CLIENT.getBalance({ address: user.account });
      if (currentBalance < MIN_BALANCE_WEI) {
        const topUpAmount = TARGET_BALANCE_WEI - currentBalance;
        const topUpHash = await walletClient.sendTransaction({
          to: user.account,
          value: topUpAmount,
        });
        // Ensure the balance is actually available before the UI submits a UserOperation.
        await PUBLIC_CLIENT.waitForTransactionReceipt({ hash: topUpHash });
      }

      return Response.json({
        id,
        account: user.account,
        pubKey: user.publicKey,
      });
    }

    const saveUserHash = await walletClient.writeContract({
      address: factoryAddress,
      abi: FACTORY_ABI,
      functionName: "saveUser",
      args: [BigInt(id), pubKey],
    });
    await PUBLIC_CLIENT.waitForTransactionReceipt({ hash: saveUserHash });

    const smartWalletAddress = await PUBLIC_CLIENT.readContract({
      address: factoryAddress,
      abi: FACTORY_ABI,
      functionName: "getAddress",
      args: [pubKey],
    });

    const fundHash = await walletClient.sendTransaction({
      to: smartWalletAddress,
      value: TARGET_BALANCE_WEI,
    });
    // Ensure prefund is visible for bundler simulation (AA21 "didn't pay prefund" otherwise).
    await PUBLIC_CLIENT.waitForTransactionReceipt({ hash: fundHash });

    const createdUser = {
      id,
      account: smartWalletAddress,
      pubKey,
    };

    return Response.json(createdUser);
  } catch (error: any) {
    console.error("Error in POST /api/users/save:", error);
    return Response.json(
      { error: error?.message || "Failed to save user." },
      { status: 500 }
    );
  }
}
