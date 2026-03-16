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
            <div className="flex-1 space-y-4 pt-1">
                <div className="flex flex-col space-y-0 border-b border-primary/10 pb-2 px-4 md:px-6">
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Payments</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Send and receive funds securely using your Zama FHEVM-powered smart wallet.
                    </p>
                </div>

                <div className="px-2 pt-2 sm:px-4 flex justify-center w-full">
                    <Tabs defaultValue="send" className="space-y-4 w-full max-w-xl mx-auto">
                        <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/40 border border-primary/10 shadow-inner rounded-xl h-12">
                            <TabsTrigger value="send" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                                <IconSend size={18} />
                                <span className="font-medium text-sm">Send</span>
                            </TabsTrigger>
                            <TabsTrigger value="receive" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                                <IconDownload size={18} />
                                <span className="font-medium text-sm">Receive</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex justify-center w-full mt-4">
                            <TabsContent value="send" className="w-full mt-0">
                                <SendTokenCard me={me} />
                            </TabsContent>

                            <TabsContent value="receive" className="w-full mt-0">
                                <ReceiveTokenCard address={me.account} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </PageContainer>
    );
}
