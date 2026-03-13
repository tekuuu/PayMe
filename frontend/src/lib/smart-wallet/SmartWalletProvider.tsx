"use client";

import React, { useContext } from "react";
import { useSmartWalletHook } from "@/lib/smart-wallet/hook/useSmartWalletHook";
import { useConfig as useWagmiConfig } from "wagmi";

import { CHAIN } from "@/config/constants";

type UseSmartWallet = ReturnType<typeof useSmartWalletHook>;

const SmartWalletContext = React.createContext<UseSmartWallet | null>(null);
export const useWalletConnect = (): UseSmartWallet => {
  const context = useContext(SmartWalletContext);
  if (!context) {
    throw new Error("useSmartWalletHook must be used within a SmartWalletProvider");
  }
  return context;
};

export function SmartWalletProvider({ children }: { children: React.ReactNode }) {
  const smartWalletValue = useSmartWalletHook();


  return (
    <>
      <SmartWalletContext.Provider value={smartWalletValue}>{children}</SmartWalletContext.Provider>
    </>
  );
}
