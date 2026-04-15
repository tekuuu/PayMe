'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SendTokenCard } from '@/components/smart-wallet/send-token-card';
import { ReceiveTokenCard } from '@/components/smart-wallet/receive-token-card';
import { useConfidentialTokenBalance } from '@/hooks/use-confidential-token-balance';
import { useMe } from '@/providers/auth-provider';
import { IconSend, IconDownload, IconLock, IconEye } from '@tabler/icons-react';
import SmartWalletOnboarding from '@/components/auth/smart-wallet-onboarding';
import { Button } from '@/components/ui/button';

function formatMicros(value?: bigint) {
    if (value === undefined) return '-';
    return (Number(value) / 1_000_000).toFixed(2);
}

export default function CustomerDashboardPage() {
    const { me } = useMe();
    const {
        decryptedValue,
        decryptWithAclSync,
        canDecrypt,
        isDecrypting,
        handleHex,
        decryptError,
        serverSignerError,
        refetch,
        isFetching,
        usingServerSigner,
    } = useConfidentialTokenBalance(me?.account);

    if (!me) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
                    <div className="p-6 bg-primary/5 rounded-full animate-pulse">
                        <IconLock size={64} className="text-primary/40" />
                    </div>
                    <div className="space-y-2 max-w-sm">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Locked</h2>
                        <p className="text-muted-foreground text-sm">
                            Access to your dashboard requires a Passkey-secured Smart Wallet.
                        </p>
                    </div>
                    <SmartWalletOnboarding variant="default" className="w-full max-w-[200px]" />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer scrollable>
            <div className="flex-1 space-y-4 pt-1">
                <div className="flex flex-col space-y-0 border-b border-primary/10 pb-2 px-4 md:px-6">
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Dashboard</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Send, receive, and inspect your private balance from one place.
                    </p>
                </div>

                <div className="px-2 pt-2 sm:px-4 flex justify-center w-full">
                    <Tabs defaultValue="send" className="space-y-4 w-full max-w-4xl mx-auto">
                        <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/40 border border-primary/10 shadow-inner rounded-xl h-12">
                            <TabsTrigger value="send" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                                <IconSend size={18} />
                                <span className="font-medium text-sm">Send</span>
                            </TabsTrigger>
                            <TabsTrigger value="receive" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                                <IconDownload size={18} />
                                <span className="font-medium text-sm">Receive</span>
                            </TabsTrigger>
                            <TabsTrigger value="private-balance" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                                <IconEye size={18} />
                                <span className="font-medium text-sm">Private Balance</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex justify-center w-full mt-4">
                            <TabsContent value="send" className="w-full mt-0">
                                <SendTokenCard me={me} />
                            </TabsContent>

                            <TabsContent value="receive" className="w-full mt-0">
                                <ReceiveTokenCard address={me.account} />
                            </TabsContent>

                            <TabsContent value="private-balance" className="w-full mt-0 space-y-4">
                                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-base font-semibold">Wallet Confidential cUSDC</h3>
                                            <p className="text-sm text-muted-foreground">
                                                This decrypts the smart wallet wrapper balance, not private card balance.
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                                                {isFetching ? 'Refreshing...' : 'Refresh'}
                                            </Button>
                                            <Button onClick={() => decryptWithAclSync()} disabled={!canDecrypt || isDecrypting || !handleHex}>
                                                {isDecrypting ? 'Decrypting...' : 'Decrypt'}
                                            </Button>
                                        </div>
                                    </div>

                                    {usingServerSigner && handleHex ? (
                                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700">
                                            Decrypt performs an on-chain ACL sync so the relayer signer can decrypt the latest wallet balance handle.
                                        </div>
                                    ) : null}

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg border bg-background p-4">
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Wallet Address</p>
                                            <p className="mt-2 font-mono text-xs break-all text-muted-foreground">{me.account}</p>
                                        </div>
                                        <div className="rounded-lg border bg-background p-4">
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Encrypted Handle</p>
                                            <p className="mt-2 font-mono text-xs break-all text-muted-foreground">{handleHex || 'No wallet confidential handle yet'}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border bg-background p-4">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Decrypted Wallet Balance</p>
                                        <p className="mt-2 text-2xl font-semibold">{formatMicros(decryptedValue)} cUSDC</p>
                                        {(decryptError || serverSignerError) ? (
                                            <p className="mt-2 text-xs text-rose-600">{decryptError || serverSignerError}</p>
                                        ) : null}
                                        {!handleHex ? (
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Wallet has no confidential cUSDC handle yet. Wrap/fund cUSDC first, then decrypt.
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </PageContainer>
    );
}