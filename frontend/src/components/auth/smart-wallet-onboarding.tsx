'use client';

import { useMe } from '@/providers/auth-provider';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from '@/components/ui/dialog';
import { Loader2, Fingerprint, Wallet, Power, Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SmartWalletOnboarding({ 
    variant = 'default',
    className 
}: { 
    variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'link',
    className?: string 
}) {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');
    const { create, get, returning, isLoading, me, disconnect } = useMe();
    const [createForm, setCreateForm] = useState(!returning);
    const [isOpen, setIsOpen] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username) {
            try {
                const created = await create(username, accountType);
                if (!created) {
                    return;
                }
                setIsOpen(false);
                if (created.accountType === 'business') {
                    router.push('/merchant');
                } else {
                    router.push('/dashboard');
                }
            } catch (err) {
                console.error("Create failed", err);
            }
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const loggedIn = await get(accountType);
            if (!loggedIn) {
                return;
            }
            setIsOpen(false);
            if (loggedIn.accountType === 'business') {
                router.push('/merchant');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            console.error("Login failed", err);
        }
    };

    if (me) {
        return (
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => disconnect()}
                className={cn("text-muted-foreground hover:text-destructive transition-colors", className)}
                title="Disconnect Wallet"
            >
                <Power className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant={variant as any} 
                    className={cn("font-medium rounded-full px-5 transition-all active:scale-95", className)}
                >
                    {createForm ? 'Create Wallet' : 'Login with Passkey'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl pb-8">
                <DialogHeader className="flex flex-col items-center space-y-4 pt-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Fingerprint className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">
                        {createForm ? 'Secure Your Identity' : 'Welcome Back'}
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground text-sm max-w-[280px]">
                        {createForm 
                            ? 'Create a private wallet with your device biometrics.' 
                            : 'Log in securely using your passkey.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="pt-6 flex flex-col items-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center space-y-4 py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm font-medium animate-pulse">Authenticating...</p>
                        </div>
                    ) : (
                        <form className="w-full space-y-5" onSubmit={createForm ? handleCreate : handleLogin}>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setAccountType('personal')}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                                            accountType === 'personal' ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        <User className={cn("h-6 w-6 mb-2", accountType === 'personal' ? "text-primary" : "text-muted-foreground")} />
                                        <span className={cn("text-sm font-medium", accountType === 'personal' ? "text-primary" : "text-muted-foreground")}>Personal</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAccountType('business')}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                                            accountType === 'business' ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        <Briefcase className={cn("h-6 w-6 mb-2", accountType === 'business' ? "text-primary" : "text-muted-foreground")} />
                                        <span className={cn("text-sm font-medium", accountType === 'business' ? "text-primary" : "text-muted-foreground")}>Business / Merchant</span>
                                    </button>
                                </div>
                                {!createForm ? (
                                    <p className="text-xs text-muted-foreground text-center">
                                        Login uses this only if on-chain role registration needs recovery.
                                    </p>
                                ) : null}
                            </div>

                            {createForm ? (
                                <div className="space-y-3">
                                    <p className="text-xs text-muted-foreground text-center">
                                        This account type will be stored on-chain for this wallet.
                                    </p>
                                </div>
                            ) : null}
                            
                            {createForm && (
                                <div className="space-y-2">
                                    <Input
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter wallet name..."
                                        className="h-12 bg-muted/30 border-border focus:ring-primary/20 text-center text-lg"
                                        disabled={isLoading}
                                    />
                                </div>
                            )}
                            
                            <Button 
                                type="submit" 
                                className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20"
                                disabled={isLoading || (createForm && !username)}
                            >
                                {createForm ? (
                                    <span className="flex items-center gap-2">
                                        <Wallet className="h-5 w-5" /> Create Wallet
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Fingerprint className="h-5 w-5" /> Sign In
                                    </span>
                                )}
                            </Button>

                            <div className="flex justify-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => setCreateForm(!createForm)}
                                    className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                                >
                                    {createForm ? 'Already have a wallet? Log in' : 'New user? Create a wallet'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
