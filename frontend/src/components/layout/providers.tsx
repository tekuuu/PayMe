'use client';
import { useTheme } from 'next-themes';
import React from 'react';
import { ActiveThemeProvider } from '../themes/active-theme';
import { Web3Providers } from '@/lib/web3-provider';
import { MeProvider } from '@/providers/auth-provider';
import { SmartWalletProvider } from '@/lib/smart-wallet/SmartWalletProvider';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <Web3Providers>
          <SmartWalletProvider>
            <MeProvider>
             {children}
            </MeProvider>
          </SmartWalletProvider>
        </Web3Providers>
      </ActiveThemeProvider>
    </>
  );
}
