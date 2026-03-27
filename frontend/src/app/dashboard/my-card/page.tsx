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
    const {
        cardAddresses,
        selectedCardAddress,
        selectedCardIndex,
        setSelectedCardIndex,
        hasCard,
        isLoading,
        isCreating,
        createCard,
    } = usePrivateCard(me || null);

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
                        <>
                            <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="w-full md:w-2/3">
                                        <label htmlFor="card-select" className="block text-sm font-medium text-muted-foreground mb-1">
                                            Selected Card
                                        </label>
                                        <select
                                            id="card-select"
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primary/30"
                                            value={selectedCardIndex}
                                            onChange={(e) => setSelectedCardIndex(Number(e.target.value))}
                                        >
                                            {cardAddresses.map((address, index) => (
                                                <option key={address} value={index}>
                                                    {address}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        className="mt-2 w-full rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 md:mt-0 md:w-auto"
                                        onClick={() => createCard()}
                                        disabled={isCreating}
                                    >
                                        {isCreating ? 'Creating...' : 'Create another card'}
                                    </button>
                                </div>
                            </div>

                            <CardOverview address={me.account as Hex} cardAddress={selectedCardAddress} />
                        </>
                    ) : (
                        <CreateCardEmptyState onCreate={createCard} isCreating={isCreating} />
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
