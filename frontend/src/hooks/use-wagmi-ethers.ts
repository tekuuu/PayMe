'use client';

import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';

export function useWagmiEthers() {
    const { address, isConnected, chain } = useAccount();
    const { data: walletClient } = useWalletClient();

    const chainId = chain?.id ?? walletClient?.chain?.id;

    const ethersProvider = useMemo(() => {
        if (!walletClient) return undefined;

        const eip1193Provider = {
            request: async (args: any) => await walletClient.request(args),
        } as any;

        return new ethers.BrowserProvider(eip1193Provider);
    }, [walletClient]);

    const ethersSigner = useMemo(() => {
        if (!ethersProvider || !address) return undefined;
        return new ethers.JsonRpcSigner(ethersProvider, address);
    }, [ethersProvider, address]);

    return {
        chainId,
        isConnected,
        ethersProvider,
        ethersSigner,
        address,
        walletClient
    };
}
