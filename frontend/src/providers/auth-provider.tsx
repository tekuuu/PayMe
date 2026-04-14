"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Address, Hex, encodeFunctionData, isAddress, toHex, zeroAddress } from "viem";
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
import { ensureUserOpPrefund } from "@/lib/smart-wallet/service/userOps/prefund";
import type { UserOperationAsHex } from "@/lib/smart-wallet/service/userOps/types";
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

function isValidSmartAccountAddress(addressLike?: string): addressLike is Address {
  return !!addressLike && isAddress(addressLike) && addressLike !== zeroAddress;
}

function isNonZeroHex32(value?: string): value is Hex {
  return !!value && /^0x[0-9a-fA-F]{64}$/.test(value) && value !== "0x0000000000000000000000000000000000000000000000000000000000000000";
}

function minBigInt(values: bigint[]) {
  let best = values[0] ?? 0n;
  for (const value of values) {
    if (value < best) best = value;
  }
  return best;
}

function tuneRoleRegistrationUserOpGas(userOp: UserOperationAsHex): UserOperationAsHex {
  const call = BigInt(userOp.callGasLimit);
  const verification = BigInt(userOp.verificationGasLimit);
  const pre = BigInt(userOp.preVerificationGas);

  // Role registration is lightweight compared to private card/FHE operations.
  // Keep these sane to avoid unnecessary large prefund top-ups on first login.
  return {
    ...userOp,
    callGasLimit: toHex(minBigInt([call, 280_000n])),
    verificationGasLimit: toHex(minBigInt([verification, 850_000n])),
    preVerificationGas: toHex(minBigInt([pre, 170_000n])),
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
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

  let lastErr: any = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const baseUserOp = await builder.buildUserOp({
        calls: [call],
        keyId: input.keyId,
        sender: input.account as Hex,
        publicKey: [BigInt(input.pubKey.x), BigInt(input.pubKey.y)],
      });

      const reducedUserOp = tuneRoleRegistrationUserOpGas(baseUserOp);
      const hasReducedGas =
        reducedUserOp.callGasLimit !== baseUserOp.callGasLimit ||
        reducedUserOp.verificationGasLimit !== baseUserOp.verificationGasLimit ||
        reducedUserOp.preVerificationGas !== baseUserOp.preVerificationGas;

      const candidateUserOps = hasReducedGas ? [reducedUserOp, baseUserOp] : [baseUserOp];

      for (let idx = 0; idx < candidateUserOps.length; idx++) {
        const candidate = candidateUserOps[idx];
        try {
          // Ensure accounts hold enough ETH for validateUserOp prefund.
          await ensureUserOpPrefund({
            account: input.account as Hex,
            userOp: candidate,
          });

          const hash = await smartWallet.sendUserOperation({ userOp: candidate });
          const receipt = await withTimeout(
            smartWallet.waitForUserOperationReceipt({ hash }),
            90_000,
            "Timed out while confirming account role registration. Please try login again."
          );
          if (!receipt || receipt.success === false || receipt.receipt?.status !== "0x1") {
            throw new Error("Failed to register account role on-chain.");
          }
          return;
        } catch (candidateErr: any) {
          const message = String(candidateErr?.message || "").toLowerCase();
          const isGasTooTight =
            message.includes("aa40") ||
            message.includes("aa23") ||
            message.includes("over verificationgaslimit");

          // If reduced gas was too tight, retry once with base builder gas in the same attempt.
          if (idx === 0 && candidateUserOps.length > 1 && isGasTooTight) {
            continue;
          }

          throw candidateErr;
        }
      }
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

      const pending = loadPendingRoleRegistration();
      const pendingKeyMatches =
        pending &&
        pending.keyId.toLowerCase() === credential.rawId.toLowerCase();

      let resolvedAccount: Address = (user?.account || zeroAddress) as Address;
      let resolvedPubKey: { x: Hex; y: Hex } = user?.pubKey || { x: "0x0", y: "0x0" };

      // Recovery path: if user lookup returns an empty record, prefer pending registration data.
      if (!isValidSmartAccountAddress(resolvedAccount) && pendingKeyMatches) {
        resolvedAccount = pending!.account;
        resolvedPubKey = pending!.pubKey;
      }

      // Deterministic recovery path from passkey public key.
      if (
        !isValidSmartAccountAddress(resolvedAccount) &&
        isNonZeroHex32(resolvedPubKey?.x) &&
        isNonZeroHex32(resolvedPubKey?.y)
      ) {
        try {
          const { getAddress } = await import("@/lib/factory/getAddress");
          const derived = await getAddress(resolvedPubKey);
          if (isValidSmartAccountAddress(derived)) {
            resolvedAccount = derived;
          }
        } catch {
          // Ignore derivation failures and surface a clear auth error below.
        }
      }

      if (!isValidSmartAccountAddress(resolvedAccount)) {
        throw new Error(
          "No smart wallet found for this passkey. If this is your first login on this device, create wallet first."
        );
      }

      let accountType = await getOnChainAccountType(resolvedAccount);
      if (!accountType) {
        const pendingMatchesWallet =
          !!pending &&
          pending.keyId.toLowerCase() === credential.rawId.toLowerCase() &&
          pending.account.toLowerCase() === resolvedAccount.toLowerCase();
        const recoveryType = accountTypeHint || (pendingMatchesWallet ? pending.accountType : undefined);

        if (recoveryType) {
          await setOnChainAccountType({
            keyId: credential.rawId,
            account: resolvedAccount,
            pubKey: resolvedPubKey,
            accountType: recoveryType,
          });
          accountType = await getOnChainAccountType(resolvedAccount);
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
        pubKey: resolvedPubKey,
        account: resolvedAccount,
        accountType,
      };

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
