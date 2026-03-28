'use client';

import { useEffect, useMemo, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useMe } from '@/providers/auth-provider';
import SmartWalletOnboarding from '@/components/auth/smart-wallet-onboarding';
import { CreateCardEmptyState } from '@/components/smart-wallet/create-card-empty-state';
import { usePrivateCard } from '@/hooks/use-private-card';
import { useFhevmContext } from '@/providers/fhevm-provider';
import { CHAIN, PRIVATE_CARD_ABI, PUBLIC_CLIENT } from '@/config/constants';
import { UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import { smartWallet } from '@/lib/smart-wallet';
import { toast } from 'sonner';
import {
  encodeFunctionData,
  Hex,
  isAddress,
  parseUnits,
  toHex,
} from 'viem';
import { IconLoader2, IconPlus, IconBuildingStore, IconLock, IconCalendarClock, IconTrash } from '@tabler/icons-react';

type SubscriptionState = {
  merchant: Hex;
  maxPerPeriod: Hex;
  spentThisPeriod: Hex;
  periodSeconds: bigint;
  lastReset: bigint;
};

const STORAGE_KEY_PREFIX = 'payme_sub_merchants_';
const APPROVE_SUBSCRIPTION_SELECTOR = '0x0f201f02';

function isZeroBytes32(value: Hex | undefined) {
  if (!value) return true;
  return /^0x0{64}$/i.test(value);
}

function relativeReset(lastReset: bigint, periodSeconds: bigint) {
  if (lastReset === 0n || periodSeconds === 0n) return 'Not set';
  const now = Math.floor(Date.now() / 1000);
  const next = Number(lastReset + periodSeconds);
  const delta = next - now;
  if (delta <= 0) return 'Period can reset now';
  const hours = Math.ceil(delta / 3600);
  if (hours < 24) return `Resets in ~${hours}h`;
  return `Resets in ~${Math.ceil(hours / 24)}d`;
}

async function flushUiFrame() {
    await new Promise<void>((resolve) => {
        if (typeof window === 'undefined') {
            resolve();
            return;
        }
        window.requestAnimationFrame(() => resolve());
    });
}

function shortAddress(address: string) {
    if (!isAddress(address)) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function collectErrorTexts(error: unknown, maxDepth = 5): string[] {
    const seen = new Set<unknown>();
    const texts: string[] = [];

    const walk = (value: unknown, depth: number) => {
        if (!value || depth > maxDepth || seen.has(value)) return;
        seen.add(value);

        if (typeof value === 'string') {
            texts.push(value);
            return;
        }

        if (Array.isArray(value)) {
            for (const item of value) walk(item, depth + 1);
            return;
        }

        if (typeof value === 'object') {
            const obj = value as Record<string, unknown>;
            const candidateKeys = ['message', 'shortMessage', 'details', 'reason', 'data', 'metaMessages'];
            for (const key of candidateKeys) {
                if (obj[key] !== undefined) walk(obj[key], depth + 1);
            }
            if (obj.cause) walk(obj.cause, depth + 1);
        }
    };

    walk(error, 0);
    return texts;
}

function findRevertData(texts: string[]): Hex | null {
    const contextualPatterns = [
        /reason:\s*(0x[0-9a-fA-F]+)/i,
        /revert(?:ed)?(?: with data)?[:\s]+(0x[0-9a-fA-F]+)/i,
        /error data[:\s]+(0x[0-9a-fA-F]+)/i,
        /execution reverted(?: with data)?:\s*(0x[0-9a-fA-F]+)/i,
        /returned data:\s*(0x[0-9a-fA-F]+)/i,
    ];

    const isLikelyRevertData = (value: string) => {
        if (!value.startsWith('0x')) return false;
        if (value.length < 10) return false;
        if (value.length % 2 !== 0) return false;
        // Plain addresses are often present in error text; don't treat them as revert data.
        if (value.length === 42) return false;
        return true;
    };

    for (const text of texts) {
        for (const pattern of contextualPatterns) {
            const match = text.match(pattern);
            const candidate = match?.[1];
            if (candidate && isLikelyRevertData(candidate)) return candidate as Hex;
        }
    }

    const fallbackHexPattern = /0x[0-9a-fA-F]{10,}/g;
    for (const text of texts) {
        const looksLikeRevertContext = /reason|revert|returned data|error data/i.test(text);
        if (!looksLikeRevertContext) continue;

        const matches = text.match(fallbackHexPattern);
        if (!matches) continue;
        for (const candidate of matches) {
            if (isLikelyRevertData(candidate)) return candidate as Hex;
        }
    }

    return null;
}

function getApproveErrorMessage(error: unknown, merchantAddress: string, signerAddress?: string) {
    const texts = collectErrorTexts(error);
    const message = texts.find((t) => t.length > 0) || 'Failed to approve subscription.';
    const revertData = findRevertData(texts);

    const selector = revertData ? revertData.slice(0, 10).toLowerCase() : null;

    if (selector === APPROVE_SUBSCRIPTION_SELECTOR) {
        const signerHint = signerAddress ? ` Signer: ${shortAddress(signerAddress)}.` : '';
        return `Approval reverted before signing for merchant ${shortAddress(merchantAddress)}.${signerHint} No passkey prompt appears because simulation failed first.`;
    }

    if (selector === '0xd0d25976') {
        const signerHint = signerAddress ? ` Signer: ${shortAddress(signerAddress)}.` : '';
        return `Merchant ${shortAddress(merchantAddress)} is rejected by on-chain policy (SenderNotAllowed).${signerHint}`;
    }

    if (typeof message === 'string' && message.includes('Execution reverted for an unknown reason')) {
        if (selector) {
            const signerHint = signerAddress ? ` Signer: ${shortAddress(signerAddress)}.` : '';
            return `Approval reverted with selector ${selector} for merchant ${shortAddress(merchantAddress)}.${signerHint}`;
        }
        const signerHint = signerAddress ? ` Signer: ${shortAddress(signerAddress)}.` : '';
        return `Approval reverted without decoded reason for merchant ${shortAddress(merchantAddress)}.${signerHint}`;
    }

    const isOpaqueSimulationRevert =
        typeof message === 'string' &&
        message.includes('eth_estimateUserOperationGas') &&
        message.includes('reason: 0x');

    if (isOpaqueSimulationRevert) {
        const signerHint = signerAddress ? ` Signer: ${shortAddress(signerAddress)}.` : '';
        return `Approval simulation failed for merchant ${shortAddress(merchantAddress)} before broadcast.${signerHint} Please retry once; if it still fails, recreate the card and try again.`;
    }

    if (typeof message === 'string' && message.includes('RPC Request failed')) {
        const signerHint = signerAddress ? ` Signer: ${shortAddress(signerAddress)}.` : '';
        return `Approval failed during simulation for merchant ${shortAddress(merchantAddress)} before passkey signing.${signerHint}`;
    }

    return message.length > 220 ? `${message.slice(0, 220)}...` : message;
}

async function diagnoseEncryptedHandleRevert(args: {
    cardAddress: Hex;
    signer: Hex;
    merchant: Hex;
    periodSeconds: bigint;
}) {
    const { cardAddress, signer, merchant, periodSeconds } = args;
    try {
        const zeroHandle = 0n;
        const zeroCallData = encodeFunctionData({
            abi: PRIVATE_CARD_ABI,
            functionName: 'approveSubscription',
            args: [merchant, zeroHandle, periodSeconds],
        });

        await PUBLIC_CLIENT.call({
            account: signer,
            to: cardAddress,
            data: zeroCallData,
        });

        return `Current card contract accepts zero handle but rejects encrypted handle for merchant ${shortAddress(merchant)}. This is a contract encrypted-input compatibility issue, not a passkey signer issue.`;
    } catch {
        return null;
    }
}

export default function SubscriptionsPage() {
    const { me } = useMe();
    const { selectedCardAddress: cardAddress, hasCard, isLoading, isCreating, createCard } = usePrivateCard(me || null);
    const { instance } = useFhevmContext();
    const builder = useMemo(() => new UserOpBuilder(CHAIN), []);

    const [merchant, setMerchant] = useState('');
    const [maxPerPeriod, setMaxPerPeriod] = useState('');
    const [periodDays, setPeriodDays] = useState('30');
    const [isApproving, setIsApproving] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const [trackedMerchants, setTrackedMerchants] = useState<Hex[]>([]);
    const [subscriptions, setSubscriptions] = useState<SubscriptionState[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!cardAddress) {
            setTrackedMerchants([]);
            return;
        }

        const storageKey = `${STORAGE_KEY_PREFIX}${cardAddress.toLowerCase()}`;
        const raw = localStorage.getItem(storageKey);
        if (!raw) {
            setTrackedMerchants([]);
            return;
        }

        try {
            const parsed = JSON.parse(raw) as string[];
            const normalized = parsed.filter((m) => isAddress(m)).map((m) => m as Hex);
            setTrackedMerchants(Array.from(new Set(normalized.map((m) => m.toLowerCase()))).map((m) => m as Hex));
        } catch {
            setTrackedMerchants([]);
        }
    }, [cardAddress]);

    const persistTrackedMerchants = (merchants: Hex[]) => {
        if (!cardAddress) return;
        const storageKey = `${STORAGE_KEY_PREFIX}${cardAddress.toLowerCase()}`;
        localStorage.setItem(storageKey, JSON.stringify(merchants));
        setTrackedMerchants(merchants);
    };

    const refreshSubscriptions = async () => {
        if (!cardAddress || trackedMerchants.length === 0) {
            setSubscriptions([]);
            return;
        }

        setIsRefreshing(true);
        try {
            const rows = await Promise.all(
                trackedMerchants.map(async (m) => {
                    const sub = await PUBLIC_CLIENT.readContract({
                        address: cardAddress,
                        abi: PRIVATE_CARD_ABI,
                        functionName: 'subscriptions',
                        args: [m],
                    });

                    return {
                        merchant: m,
                        maxPerPeriod: sub[0] as Hex,
                        spentThisPeriod: sub[1] as Hex,
                        periodSeconds: sub[2] as bigint,
                        lastReset: sub[3] as bigint,
                    };
                })
            );

            setSubscriptions(rows);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to load subscriptions.');
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        refreshSubscriptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardAddress, trackedMerchants]);

    const onApprove = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!me || !cardAddress) {
            toast.error('Connect a wallet and create a card first.');
            return;
        }
        if (!instance) {
            toast.error('FHE engine is still initializing. Try again in a few seconds.');
            return;
        }
        if (!isAddress(merchant)) {
            toast.error('Enter a valid merchant address.');
            return;
        }

        let maxRaw: bigint;
        let periodSeconds: bigint;
        try {
            maxRaw = parseUnits(maxPerPeriod, 6);
            periodSeconds = BigInt(Math.floor(Number(periodDays) * 86400));
        } catch {
            toast.error('Invalid amount or billing period.');
            return;
        }

        if (maxRaw <= 0n || periodSeconds <= 0n) {
            toast.error('Amount and billing period must be greater than zero.');
            return;
        }

        setIsApproving(true);
        const loadingToastId = toast.loading('Starting approval...');
        await flushUiFrame();

        let resolvedSender: Hex | null = null;
        let slowStepToastTimer: ReturnType<typeof setTimeout> | undefined;
        try {
            toast.loading('Preparing encrypted subscription limit...', { id: loadingToastId });
            const encryptedInput = instance.createEncryptedInput(cardAddress, me.account as Hex);
            encryptedInput.add64(maxRaw);
            const { handles } = await encryptedInput.encrypt();
            toast.loading('Building smart-wallet operation...', { id: loadingToastId });

            smartWallet.init();

            const call = {
                dest: cardAddress,
                value: 0n,
                data: encodeFunctionData({
                    abi: PRIVATE_CARD_ABI,
                    functionName: 'approveSubscription',
                    args: [merchant as Hex, BigInt(toHex(handles[0])), periodSeconds],
                }),
            };

            resolvedSender = await builder.getSenderAddress(me.keyId);
            if (resolvedSender.toLowerCase() !== me.account.toLowerCase()) {
                throw new Error(`Passkey/account mismatch. Expected ${shortAddress(me.account)}, but key resolves to ${shortAddress(resolvedSender)}.`);
            }

            const userOp = await builder.buildUserOp({
                calls: [call],
                keyId: me.keyId,
            });

                        // Gas simulation can take a while; keep the user informed during this step.
                        slowStepToastTimer = setTimeout(() => {
                                toast.loading('Still working. Estimating gas with the bundler...', { id: loadingToastId });
                        }, 2500);

            const hash = await smartWallet.sendUserOperation({ userOp });
            toast.loading('Waiting for on-chain confirmation...', { id: loadingToastId });
            const receipt = await smartWallet.waitForUserOperationReceipt({ hash });

            if (!receipt || receipt.success === false || receipt.receipt?.status !== '0x1') {
                throw new Error('Subscription approval reverted.');
            }

            const normalized = merchant.toLowerCase() as Hex;
            const merged = Array.from(new Set([...trackedMerchants.map((m) => m.toLowerCase()), normalized])) as Hex[];
            persistTrackedMerchants(merged);

            toast.success('Subscription approved successfully.', { id: loadingToastId });
            setMerchant('');
            setMaxPerPeriod('');
            setPeriodDays('30');
            setIsAddDialogOpen(false);
        } catch (error: unknown) {
            console.error('Subscription approve failed', error);
            let message = getApproveErrorMessage(error, merchant, resolvedSender || me.account);

            const isGenericExecutionRevert =
                message.includes('Approval reverted without decoded reason') ||
                message.includes('Execution reverted for an unknown reason') ||
                message.includes('Approval failed during simulation');

            if (isGenericExecutionRevert && resolvedSender && cardAddress && isAddress(merchant)) {
                const diagnosed = await diagnoseEncryptedHandleRevert({
                    cardAddress,
                    signer: resolvedSender,
                    merchant: merchant as Hex,
                    periodSeconds,
                });
                if (diagnosed) message = diagnosed;
            }

            toast.error(message, { id: loadingToastId });
        } finally {
            if (slowStepToastTimer) clearTimeout(slowStepToastTimer);
            setIsApproving(false);
        }
    };

    if (!me) {
        return (
            <PageContainer>
                <div className='flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center'>
                    <h2 className='text-2xl font-bold tracking-tight'>Subscriptions Locked</h2>
                    <p className='max-w-sm text-sm text-muted-foreground'>Connect your passkey smart wallet to manage merchant subscriptions.</p>
                    <SmartWalletOnboarding variant='default' className='w-full max-w-[220px]' />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer scrollable>
            <div className="flex-1 space-y-4 pt-1">
                <div className="flex items-start sm:items-center justify-between space-y-0 pb-2 border-b border-primary/10">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Subscriptions</h2>
                        <p className="text-sm text-muted-foreground mt-1">Manage your confidential recurring payments and allowances.</p>
                    </div>
                    {hasCard && (
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className='gap-2 shadow-sm hover:shadow dark:hover:shadow-primary/10 transition-all'>
                                    <IconPlus size={16} />
                                    <span className="hidden sm:inline">New Subscription</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10 text-primary">
                                    <IconLock size={120} />
                                </div>
                                <DialogHeader>
                                    <DialogTitle className="text-xl flex items-center gap-2">
                                        <IconBuildingStore className="text-primary" size={20} />
                                        New Subscription
                                    </DialogTitle>
                                    <DialogDescription className="text-sm">
                                        Approve a merchant with an <strong className="text-primary font-medium">encrypted max spend</strong> per billing period. Your limits stay entirely confidential.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={onApprove} className='space-y-4 pt-2 relative z-10'>
                                    <div className='space-y-1.5'>
                                        <Label htmlFor='merchant' className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Merchant Address</Label>
                                        <Input
                                            id='merchant'
                                            placeholder='0x...'
                                            className="font-mono text-sm shadow-inner bg-muted/30"
                                            value={merchant}
                                            onChange={(e) => setMerchant(e.target.value)}
                                            disabled={isApproving}
                                        />
                                    </div>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className='space-y-1.5'>
                                            <Label htmlFor='max' className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Max Spend</Label>
                                            <div className="relative">
                                                <Input
                                                    id='max'
                                                    placeholder='e.g. 20'
                                                    className="font-mono text-sm shadow-inner bg-muted/30 pr-12"
                                                    value={maxPerPeriod}
                                                    onChange={(e) => setMaxPerPeriod(e.target.value)}
                                                    disabled={isApproving}
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                                    cUSDC
                                                </div>
                                            </div>
                                        </div>
                                        <div className='space-y-1.5'>
                                            <Label htmlFor='period' className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Period</Label>
                                            <div className="relative">
                                                <Input
                                                    id='period'
                                                    placeholder='30'
                                                    className="font-mono text-sm shadow-inner bg-muted/30 pr-12"
                                                    value={periodDays}
                                                    onChange={(e) => setPeriodDays(e.target.value)}
                                                    disabled={isApproving}
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                                    Days
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {isApproving && (
                                        <div className='rounded-lg bg-primary/10 border border-primary/20 p-3 text-xs text-primary flex items-start gap-2'>
                                            <IconLoader2 size={16} className='animate-spin mt-0.5 shrink-0' />
                                            <p>
                                                <strong>Encrypting & Approving.</strong> Please sign the transaction and keep this window open until confirmed.
                                            </p>
                                        </div>
                                    )}
                                    <div className="pt-2">
                                        <Button type='submit' disabled={isApproving} className='w-full shadow-md text-sm font-medium'>
                                            {isApproving ? 'Approving...' : 'Confirm Subscription'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {isLoading ? (
                    <div className='flex items-center justify-center p-12'>
                        <span className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                    </div>
                ) : !hasCard ? (
                    <CreateCardEmptyState onCreate={createCard} isCreating={isCreating} />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {subscriptions.length > 0 ? (
                                subscriptions.map((sub) => {
                                    const active = !isZeroBytes32(sub.maxPerPeriod);
                                    const days = Number(sub.periodSeconds) / 86400;

                                    return (
                                        <Card key={sub.merchant} className='group relative overflow-hidden transition-all hover:shadow-xl dark:hover:shadow-primary/5 border-primary/10 bg-gradient-to-b from-background to-muted/20'>
                                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10">
                                                <IconLock size={80} />
                                            </div>
                                            <CardHeader className='pb-4'>
                                                <div className='flex items-center justify-between gap-4'>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                            <IconBuildingStore size={20} />
                                                        </div>
                                                        <div>
                                                            <CardTitle className='text-sm font-medium tracking-tight'>Merchant</CardTitle>
                                                            <div className='font-mono text-xs text-muted-foreground mt-0.5'>{shortAddress(sub.merchant)}</div>
                                                        </div>
                                                    </div>
                                                    <Badge variant={active ? 'default' : 'secondary'} className={active ? 'bg-primary/15 text-primary hover:bg-primary/25 border-0' : ''}>
                                                        {active ? 'Active' : 'Not set'}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            
                                            <CardContent className='space-y-4'>
                                                <div className="grid grid-cols-2 gap-4 rounded-lg border bg-background/50 p-3 shadow-inner">
                                                    <div className='space-y-1.5'>
                                                        <div className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5'>
                                                            <IconLock size={12} />
                                                            Max Spend
                                                        </div>
                                                        <div className='font-mono text-xs font-medium bg-muted py-1 flex items-center rounded px-2 w-fit max-w-full overflow-hidden text-ellipsis whitespace-nowrap' title={sub.maxPerPeriod}>
                                                            {sub.maxPerPeriod.slice(0, 10)}...
                                                        </div>
                                                    </div>
                                                    <div className='space-y-1.5'>
                                                        <div className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5'>
                                                            <IconLock size={12} />
                                                            Spent
                                                        </div>
                                                        <div className='font-mono text-xs font-medium bg-muted py-1 flex items-center rounded px-2 w-fit max-w-full overflow-hidden text-ellipsis whitespace-nowrap' title={sub.spentThisPeriod}>
                                                            {sub.spentThisPeriod.slice(0, 10)}...
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className='flex items-center justify-between text-xs text-muted-foreground pt-1'>
                                                    <div className='flex items-center gap-1.5'>
                                                        <IconCalendarClock size={14} className="text-primary/70" />
                                                        <span>{Number.isFinite(days) ? days : 0}d period &bull; {relativeReset(sub.lastReset, sub.periodSeconds)}</span>
                                                    </div>
                                                    <Button
                                                        size='icon'
                                                        variant='ghost'
                                                        className='h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                                                        title="Remove from list"
                                                        onClick={() => {
                                                            const next = trackedMerchants.filter((m) => m.toLowerCase() !== sub.merchant.toLowerCase());
                                                            persistTrackedMerchants(next);
                                                        }}
                                                    >
                                                        <IconTrash size={14} />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            ) : (
                                <div className='col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 py-16 text-center shadow-inner'>
                                    <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary opacity-80">
                                        <IconBuildingStore size={32} />
                                    </div>
                                    <h3 className="text-lg font-semibold tracking-tight text-foreground">No Subscriptions Found</h3>
                                    <p className='text-sm text-muted-foreground mt-1 max-w-sm'>
                                        {isRefreshing ? 'Loading your confidential subscriptions...' : "You haven't approved any subscriptions yet. Click the + button above to approve a new merchant."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </PageContainer>
    );
}
