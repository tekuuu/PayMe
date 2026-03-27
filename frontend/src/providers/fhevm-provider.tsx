'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useFhevm } from '@/lib/fhevm-sdk/react';
import type { FhevmInstance } from '@/lib/fhevm-sdk/fhevmTypes';
import { CHAIN } from '@/config/constants';

interface FhevmContextType {
    instance: FhevmInstance | undefined;
    status: string;
    error: Error | undefined;
    refresh: () => void;
}

const FhevmContext = createContext<FhevmContextType>({
    instance: undefined,
    status: 'idle',
    error: undefined,
    refresh: () => {},
});

export function FhevmProvider({ children }: { children: React.ReactNode }) {
    const { chain } = useAccount();
    const { data: walletClient } = useWalletClient();

    // Prefer wallet provider for signing-compatible contexts, fallback to RPC so FHE engine can still initialize.
    const provider = useMemo(() => {
        if (walletClient) {
            return {
                request: async (args: any) => await walletClient.request(args),
            } as any;
        }

        return process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://ethereum-sepolia-rpc.publicnode.com';
    }, [walletClient]);

    const chainId = chain?.id ?? walletClient?.chain?.id ?? CHAIN.id;

    const { instance, status, error, refresh } = useFhevm({
        provider,
        chainId,
        enabled: !!chainId,
    });

    return (
        <FhevmContext.Provider value={{ instance, status, error, refresh }}>
            {children}
        </FhevmContext.Provider>
    );
}

export const useFhevmContext = () => useContext(FhevmContext);
