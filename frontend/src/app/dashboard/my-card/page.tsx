'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconCreditCard, IconLock, IconShieldCheck } from '@tabler/icons-react';
import { useMe } from '@/providers/auth-provider';
import SmartWalletOnboarding from '@/components/auth/smart-wallet-onboarding';
import { SendTokenCard } from '@/components/smart-wallet/send-token-card';

export default function MyCardPage() {
    const { me } = useMe();

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
            <div className="flex-1 space-y-6 pt-6">
                <div className="flex items-center justify-between space-y-2 border-b pb-4 px-4 md:px-8">
                    <h2 className="text-3xl font-bold tracking-tight">My Card</h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-semibold border border-emerald-500/20">
                        <IconShieldCheck size={14} /> Smart Wallet Linked
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 p-4 md:p-8">
                    <Card className="overflow-hidden border bg-slate-950 text-white shadow-2xl relative max-w-xs">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
                        <CardHeader className="relative pb-2 px-6 pt-6">
                            <div className="absolute top-4 right-4 text-primary">
                                <IconCreditCard size={24} />
                            </div>
                            <CardTitle className="text-lg font-medium tracking-wide">Secure Virtual Card</CardTitle>
                            <CardDescription className="text-slate-400 text-sm">Zama FHEVM Powered</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-16 pb-8 px-6 relative">
                            <div className="space-y-6">
                                <div className="text-2xl font-mono tracking-[0.2em]">
                                    •••• •••• •••• ••••
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Card Holder</p>
                                        <p className="text-base font-medium tracking-tight uppercase truncate max-w-[180px]">
                                            {me.account?.slice(0, 10)}...{me.account?.slice(-6)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Status</p>
                                        <p className="text-sm font-medium text-emerald-400">ACTIVE</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <SendTokenCard me={me} />
                </div>
            </div>
        </PageContainer>
    );
}
