'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconCreditCard, IconLock, IconShieldCheck } from '@tabler/icons-react';
import { useMe } from '@/providers/auth-provider';
import SmartWalletOnboarding from '@/components/auth/smart-wallet-onboarding';
import { CardOverview } from '@/components/smart-wallet/card-overview';
import { CreateCardEmptyState } from '@/components/smart-wallet/create-card-empty-state';
import { Hex } from 'viem';
import { usePrivateCard } from '@/hooks/use-private-card';

export default function MyCardPage() {
    const { me } = useMe();
    const { hasCard, cardAddress, isLoading, isCreating, createCard } = usePrivateCard(me || null);

    if (!me) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
                    <div className="p-6 bg-primary/5 rounded-full animate-pulse">
                        <IconLock size={64} className="text-primary/40" />
                    </div>
                    <div className="space-y-2 max-w-sm">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Secure Vault Locked</h2>
                        <p className="text-muted-foreground text-sm">
                            Access to your private virtual card requires a Passkey-secured Smart Wallet.
                        </p>
                    </div>
                    <SmartWalletOnboarding variant="default" className="w-full max-w-[200px]" />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer scrollable>
            <div className="flex-1 space-y-1 pt-1">
                <div className="flex items-center justify-between space-y-0 border-b pb-1 px-2 md:px-4">
                    <h2 className="text-xl font-bold tracking-tight">My Card</h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-semibold border border-emerald-500/20">
                        <IconShieldCheck size={12} /> Smart Wallet Linked
                    </div>
                </div>

                <div className="px-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <span className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                    ) : hasCard ? (
                        <CardOverview address={me.account as Hex} cardAddress={cardAddress} />
                    ) : (
                        <CreateCardEmptyState onCreate={createCard} isCreating={isCreating} />
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
