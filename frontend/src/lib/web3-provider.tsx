'use client';

import React, { useEffect, useState } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultConfig,
    RainbowKitProvider,
    darkTheme,
    lightTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useTheme } from 'next-themes';

const config = getDefaultConfig({
    appName: 'PayMe Private Card',
    projectId: 'YOUR_PROJECT_ID', // Better to use a placeholder or let user provide
    chains: [sepolia],
    ssr: true,
});

const queryClient = new QueryClient();

function RainbowKitWrapper({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <RainbowKitProvider
            theme={resolvedTheme === 'dark'
                ? darkTheme({
                    accentColor: 'oklch(0.7 0.15 200)', // Matches --primary in dark mode
                    accentColorForeground: 'black',
                    borderRadius: 'medium',
                })
                : lightTheme({
                    accentColor: 'oklch(0.55 0.18 250)', // Matches --primary in light mode
                    accentColorForeground: 'white',
                    borderRadius: 'medium',
                })
            }
        >
            {children}
        </RainbowKitProvider>
    );
}

export function Web3Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitWrapper>
                    {children}
                </RainbowKitWrapper>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
