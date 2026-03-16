"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Address, Hex, zeroAddress } from "viem";
import { WebAuthn } from "@/lib/web-authn/web-authn";
import { saveUser } from "@/lib/factory";
import { getUser } from "@/lib/factory/getUser";
import { useWalletConnect } from "@/lib/smart-wallet/SmartWalletProvider";
import { toast } from "sonner";

export type Me = {
  account: Address;
  keyId: Hex;
  pubKey: {
    x: Hex;
    y: Hex;
  };
};

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

  async function create(username: string) {
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
      };

      if (me.account === zeroAddress) {
        const { getAddress } = await import("@/lib/factory/getAddress");
        me.account = await getAddress(credential.pubKey);
      }

      if (me === undefined) {
        console.log("error while saving user");
        return;
      }
      localStorage.setItem("passkeys4337.me", JSON.stringify(me));
      localStorage.setItem("passkeys4337.returning", "true");
      // walletConnect.smartWalletAddress = me.account;
      init(me.account);
      setIsReturning(true);
      setMe(me);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to create wallet.");
    } finally {
      setIsLoading(false);
    }
  }

  async function get() {
    setIsLoading(true);
    try {
      const credential = await WebAuthn.get();
      if (!credential) {
        return;
      }
      const user = await getUser(credential.rawId);

      const me = {
        keyId: credential.rawId,
        pubKey: user?.pubKey || { x: "0x0", y: "0x0" }, // We don't have pubkey from get(), it comes from contract
        account: user?.account || zeroAddress,
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
        setMe(parsedMe);
        if (parsedMe.account) {
          init(parsedMe.account);
        }
      } catch (e) {
        console.log("error while parsing me");
      }
    }
    if (returning === "true") {
      setIsReturning(true);
    }
    setIsMounted(true);
  }, []);

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
