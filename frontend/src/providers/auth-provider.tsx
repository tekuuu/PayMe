"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Address, Hex, encodeFunctionData, isAddress, zeroAddress } from "viem";
import { WebAuthn } from "@/lib/web-authn/web-authn";
import { saveUser } from "@/lib/factory";
import { getUser } from "@/lib/factory/getUser";
import { useWalletConnect } from "@/lib/smart-wallet/SmartWalletProvider";
import {
  ACCOUNT_REGISTRY_ABI,
  ACCOUNT_REGISTRY_ADDRESS,
  ACCOUNT_ROLE_BOTH,
  ACCOUNT_ROLE_MERCHANT,
  ACCOUNT_ROLE_PERSONAL,
  CHAIN,
  PUBLIC_CLIENT,
} from "@/config/constants";
import { smartWallet } from "@/lib/smart-wallet";
import { UserOpBuilder } from "@/lib/smart-wallet/service/userOps";
import { toast } from "sonner";

export type AccountType = "personal" | "business";

export type Me = {
  account: Address;
  keyId: Hex;
  accountType: AccountType;
  pubKey: {
    x: Hex;
    y: Hex;
  };
};

const PENDING_ROLE_KEY = "passkeys4337.pending-role";

type PendingRoleRegistration = {
  keyId: Hex;
  account: Address;
  pubKey: { x: Hex; y: Hex };
  accountType: AccountType;
  createdAt: number;
};

function roleMaskToAccountType(roleMask: number): AccountType | null {
  if ((roleMask & ACCOUNT_ROLE_BOTH) === ACCOUNT_ROLE_BOTH || (roleMask & ACCOUNT_ROLE_MERCHANT) === ACCOUNT_ROLE_MERCHANT) {
    return "business";
  }
  if ((roleMask & ACCOUNT_ROLE_PERSONAL) === ACCOUNT_ROLE_PERSONAL) {
    return "personal";
  }
  return null;
}

function loadPendingRoleRegistration(): PendingRoleRegistration | null {
  try {
    const raw = localStorage.getItem(PENDING_ROLE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingRoleRegistration;
    if (!parsed?.keyId || !parsed?.account || !parsed?.accountType || !parsed?.pubKey?.x || !parsed?.pubKey?.y) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePendingRoleRegistration(value: PendingRoleRegistration) {
  localStorage.setItem(PENDING_ROLE_KEY, JSON.stringify(value));
}

function clearPendingRoleRegistration() {
  localStorage.removeItem(PENDING_ROLE_KEY);
}

function accountTypeToRoleMask(accountType: AccountType) {
  return accountType === "business" ? ACCOUNT_ROLE_MERCHANT : ACCOUNT_ROLE_PERSONAL;
}

async function getOnChainAccountType(account?: string): Promise<AccountType | null> {
  if (!account || !isAddress(account) || ACCOUNT_REGISTRY_ADDRESS === zeroAddress) {
    return null;
  }

  try {
    const roleMask = await PUBLIC_CLIENT.readContract({
      address: ACCOUNT_REGISTRY_ADDRESS as Address,
      abi: ACCOUNT_REGISTRY_ABI,
      functionName: "getRoles",
      args: [account as Address],
    });
    return roleMaskToAccountType(Number(roleMask));
  } catch {
    return null;
  }
}

async function setOnChainAccountType(input: {
  keyId: Hex;
  account: Address;
  pubKey: { x: Hex; y: Hex };
  accountType: AccountType;
}) {
  if (!isAddress(input.account) || input.account === zeroAddress) {
    throw new Error("Invalid smart account address for role registration.");
  }
  if (ACCOUNT_REGISTRY_ADDRESS === zeroAddress) {
    throw new Error("Account registry is not configured. Set NEXT_PUBLIC_ACCOUNT_REGISTRY_ADDRESS.");
  }

  const currentType = await getOnChainAccountType(input.account);
  if (currentType === input.accountType) {
    return;
  }

  const roleMask = accountTypeToRoleMask(input.accountType);

  const waitForBalance = async (opts: { address: Address; minWei: bigint; timeoutMs: number }) => {
    const start = Date.now();
    while (Date.now() - start < opts.timeoutMs) {
      try {
        const bal = await PUBLIC_CLIENT.getBalance({ address: opts.address });
        if (bal >= opts.minWei) return;
      } catch {
        // ignore transient RPC errors
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  };

  smartWallet.init();
  const builder = new UserOpBuilder(CHAIN);
  const call = {
    dest: ACCOUNT_REGISTRY_ADDRESS as Address,
    value: 0n,
    data: encodeFunctionData({
      abi: ACCOUNT_REGISTRY_ABI,
      functionName: "setMyRoles",
      args: [roleMask],
    }),
  };

  // Fresh wallets are funded asynchronously by the backend. If we submit too fast,
  // bundler simulation can fail with AA21 (prefund). We wait briefly and retry.
  await waitForBalance({ address: input.account, minWei: 1n, timeoutMs: 15_000 });

  let lastErr: any = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const userOp = await builder.buildUserOp({
        calls: [call],
        keyId: input.keyId,
        sender: input.account as Hex,
        publicKey: [BigInt(input.pubKey.x), BigInt(input.pubKey.y)],
      });

      const hash = await smartWallet.sendUserOperation({ userOp });
      const receipt = await smartWallet.waitForUserOperationReceipt({ hash });
      if (!receipt || receipt.success === false || receipt.receipt?.status !== "0x1") {
        throw new Error("Failed to register account role on-chain.");
      }
      return;
    } catch (e: any) {
      lastErr = e;
      const message = String(e?.message || "");
      const isPrefund =
        message.includes("AA21") ||
        message.toLowerCase().includes("prefund") ||
        message.toLowerCase().includes("didn't pay prefund");
      if (!isPrefund || attempt === 2) {
        throw e;
      }
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }

  throw lastErr ?? new Error("Failed to register account role on-chain.");
}

function useMeHook() {
  const [isLoading, setIsLoading] = useState(false);
  const [me, setMe] = useState<Me | null>();
  const [isReturning, setIsReturning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { init } = useWalletConnect();

  function disconnect() {
    localStorage.removeItem("passkeys4337.me");
    setMe(null);
  }

  async function create(username: string, accountType: AccountType) {
    setIsLoading(true);
    try {
      const credential = await WebAuthn.create({ username });

      if (!credential) {
        return;
      }
      const user = await saveUser({
        id: credential.rawId,
        pubKey: credential.pubKey,
      });

      const me = {
        keyId: credential.rawId,
        pubKey: credential.pubKey,
        account: user?.account || zeroAddress,
        accountType,
      };

      if (me.account === zeroAddress) {
        const { getAddress } = await import("@/lib/factory/getAddress");
        me.account = await getAddress(credential.pubKey);
      }

      if (me === undefined) {
        console.log("error while saving user");
        return;
      }
      savePendingRoleRegistration({
        keyId: credential.rawId,
        account: me.account,
        pubKey: me.pubKey,
        accountType,
        createdAt: Date.now(),
      });
      await setOnChainAccountType({
        keyId: credential.rawId,
        account: me.account,
        pubKey: me.pubKey,
        accountType,
      });
      clearPendingRoleRegistration();
      localStorage.setItem("passkeys4337.me", JSON.stringify(me));
      localStorage.setItem("passkeys4337.returning", "true");
      // walletConnect.smartWalletAddress = me.account;
      init(me.account);
      setIsReturning(true);
      setMe(me);
      return me;
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to create wallet.");
    } finally {
      setIsLoading(false);
    }
  }

  async function get(accountTypeHint?: AccountType) {
    setIsLoading(true);
    try {
      const credential = await WebAuthn.get();
      if (!credential) {
        return;
      }
      const user = await getUser(credential.rawId);

      let accountType = await getOnChainAccountType(user?.account);
      if (!accountType) {
        const pending = loadPendingRoleRegistration();
        const pendingMatchesWallet =
          pending &&
          pending.keyId.toLowerCase() === credential.rawId.toLowerCase() &&
          pending.account.toLowerCase() === (user?.account || zeroAddress).toLowerCase();
        const recoveryType = accountTypeHint || (pendingMatchesWallet ? pending.accountType : undefined);

        if (recoveryType) {
          await setOnChainAccountType({
            keyId: credential.rawId,
            account: (user?.account || zeroAddress) as Address,
            pubKey: user?.pubKey || { x: "0x0", y: "0x0" },
            accountType: recoveryType,
          });
          accountType = await getOnChainAccountType(user?.account);
          if (accountType) {
            clearPendingRoleRegistration();
          }
        }
      }
      if (!accountType) {
        throw new Error(
          "Account type is missing on-chain for this wallet. Select Personal or Business in Login to finish registration."
        );
      }

      const me = {
        keyId: credential.rawId,
        pubKey: user?.pubKey || { x: "0x0", y: "0x0" }, // We don't have pubkey from get(), it comes from contract
        account: user?.account || zeroAddress,
        accountType,
      };

      if (me.account === zeroAddress) {
        throw new Error("user not found");
      }

      localStorage.setItem("passkeys4337.me", JSON.stringify(me));
      localStorage.setItem("passkeys4337.returning", "true");
      // walletConnect.smartWalletAddress = me.account;
      init(me.account);
      setIsReturning(true);
      setMe(me);
      return me;
    } catch (e: any) {
      localStorage.removeItem("passkeys4337.returning");
      disconnect();
      console.error(e);
      toast.error(e?.message || "Failed to access wallet.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const me = localStorage.getItem("passkeys4337.me");
    const returning = localStorage.getItem("passkeys4337.returning");
    if (me) {
      try {
        const parsedMe = JSON.parse(me);
        const hydrate = async () => {
          const chainType = await getOnChainAccountType(parsedMe.account);
          if (!chainType) {
            localStorage.removeItem("passkeys4337.me");
            setIsMounted(true);
            return;
          }
          parsedMe.accountType = chainType;
          localStorage.setItem("passkeys4337.me", JSON.stringify(parsedMe));
          setMe(parsedMe);
          if (parsedMe.account) {
            init(parsedMe.account);
          }
          setIsMounted(true);
        };
        hydrate();
      } catch (e) {
        console.log("error while parsing me");
        setIsMounted(true);
      }
    } else {
      setIsMounted(true);
    }

    if (returning === "true") {
      setIsReturning(true);
    }
  }, []);

  useEffect(() => {
    if (!me?.account) return;

    const refreshRole = async () => {
      const chainType = await getOnChainAccountType(me.account);
      if (!chainType) return;
      if (chainType !== me.accountType) {
        const next = { ...me, accountType: chainType };
        localStorage.setItem("passkeys4337.me", JSON.stringify(next));
        setMe(next);
      }
    };
    refreshRole();
  }, [me?.account]);

  return {
    isLoading,
    isMounted,
    me,
    returning: isReturning,
    create,
    get,
    disconnect,
  };
}

type UseMeHook = ReturnType<typeof useMeHook>;
const MeContext = createContext<UseMeHook | null>(null);

export const useMe = (): UseMeHook => {
  const context = useContext(MeContext);
  if (!context) {
    throw new Error("useMeHook must be used within a MeProvider");
  }
  return context;
};

export function MeProvider({ children }: { children: React.ReactNode }) {
  const hook = useMeHook();

  return <MeContext.Provider value={hook}>{children}</MeContext.Provider>;
}
