'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SendTokenCard } from '@/components/smart-wallet/send-token-card';
import { ReceiveTokenCard } from '@/components/smart-wallet/receive-token-card';
import { useMe } from '@/providers/auth-provider';
import { IconSend, IconDownload, IconLock } from '@tabler/icons-react';
import SmartWalletOnboarding from '@/components/auth/smart-wallet-onboarding';

export default function PaymentsPage() {
    const { me } = useMe();

    if (!me) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
                    <div className="p-6 bg-primary/5 rounded-full animate-pulse">
                        <IconLock size={64} className="text-primary/40" />
                    </div>
                    <div className="space-y-2 max-w-sm">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Payments Locked</h2>
                        <p className="text-muted-foreground text-sm">
                            Access to payments requires a Passkey-secured Smart Wallet.
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
                <div className="flex flex-col space-y-0 border-b pb-1 px-4 md:px-6">
                    <h2 className="text-xl font-bold tracking-tight">Payments</h2>
                    <p className="text-muted-foreground text-xs">
                        Send and receive funds securely using your Zama FHEVM-powered smart wallet.
                    </p>
                </div>

                <div className="px-2 pt-2">
                    <Tabs defaultValue="send" className="space-y-4">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="send" className="flex items-center gap-2">
                                <IconSend size={16} />
                                Send
                            </TabsTrigger>
                            <TabsTrigger value="receive" className="flex items-center gap-2">
                                <IconDownload size={16} />
                                Receive
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="send" className="space-y-4">
                            <SendTokenCard me={me} />
                        </TabsContent>

                        <TabsContent value="receive" className="space-y-4">
                            <ReceiveTokenCard address={me.account} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </PageContainer>
    );
}
