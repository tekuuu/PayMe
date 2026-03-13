'use client';

import React from 'react';
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

export function Web3Providers({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme();

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
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
            </QueryClientProvider>
        </WagmiProvider>
    );
}
