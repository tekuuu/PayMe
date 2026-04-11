'use client';

import { useMe } from '@/providers/auth-provider';
import SmartWalletOnboarding from '@/components/auth/smart-wallet-onboarding';
import { Fingerprint } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardGuard({
    children,
    requiredAccountType
}: {
    children: React.ReactNode;
    requiredAccountType?: 'personal' | 'business';
}) {
    const { me, isLoading, isMounted } = useMe();
    const router = useRouter();

    useEffect(() => {
        if (!me || !requiredAccountType) return;
        if (me.accountType !== requiredAccountType) {
            router.replace(me.accountType === 'business' ? '/merchant' : '/dashboard/my-card');
        }
    }, [me, requiredAccountType, router]);

    // Prevent hydration mismatch
    if (!isMounted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <div className="animate-pulse bg-muted h-32 w-32 rounded-full" />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
                <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-sm font-medium animate-pulse">Verifying Session...</p>
            </div>
        );
    }

    if (!me) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-foreground rounded-full blur opacity-25 animate-pulse"></div>
                    <div className="relative p-6 bg-card border border-border rounded-full shadow-2xl">
                        <Fingerprint className="h-16 w-16 text-primary" />
                    </div>
                </div>
                
                <div className="text-center space-y-3 max-w-sm px-4">
                    <h1 className="text-3xl font-bold tracking-tight">Access Locked</h1>
                    <p className="text-muted-foreground">
                        Please connect your private card wallet to view your secure dashboard and transactions.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <SmartWalletOnboarding className="h-14 px-8 text-lg" variant="default" />
                    <p className="text-xs text-muted-foreground">
                        Secured by device biometrics (WebAuthn)
                    </p>
                </div>
            </div>
        );
    }

    if (requiredAccountType && me.accountType !== requiredAccountType) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-3">
                <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground">Redirecting to your authorized portal...</p>
            </div>
        );
    }

    return <>{children}</>;
}
