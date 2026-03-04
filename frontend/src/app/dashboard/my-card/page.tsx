'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconCreditCard, IconLock, IconShieldCheck } from '@tabler/icons-react';

export default function MyCardPage() {
    return (
        <PageContainer scrollable>
            <div className="flex-1 space-y-6 pt-6">
                <div className="flex items-center justify-between space-y-2 border-b pb-4 px-4 md:px-8">
                    <h2 className="text-3xl font-bold tracking-tight">My Card</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 p-4 md:p-8">
                    <Card className="overflow-hidden border bg-slate-950 text-white shadow-2xl relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
                        <CardHeader className="relative pb-0">
                            <div className="absolute top-6 right-6 text-primary">
                                <IconCreditCard size={32} />
                            </div>
                            <CardTitle className="text-xl font-medium tracking-wide">Secure Virtual Card</CardTitle>
                            <CardDescription className="text-slate-400">Zama FHEVM Powered</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-20 pb-10 relative">
                            <div className="space-y-8">
                                <div className="text-3xl font-mono tracking-[0.25em]">
                                    •••• •••• •••• ••••
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Card Holder</p>
                                        <p className="text-lg font-medium tracking-tight">NOT LINKED</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 border shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <IconLock className="text-primary" size={24} />
                                </div>
                                <div>
                                    <CardTitle>Privacy Controls</CardTitle>
                                    <CardDescription>Manage your card's end-to-end encryption</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                                <IconShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Your card data is fully encrypted using Zama's Fully Homomorphic Encryption (fhevm).
                                    Transactions are processed blindly without revealing details.
                                </p>
                            </div>
                            <div className="pt-2">
                                <p className="text-xs text-muted-foreground italic">
                                    Note: Security parameters are automatically optimized for your active session.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
}
