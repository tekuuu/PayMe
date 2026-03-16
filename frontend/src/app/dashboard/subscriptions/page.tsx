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
  zeroAddress,
} from 'viem';
import { IconLoader2, IconPlus } from '@tabler/icons-react';

type SubscriptionState = {
  merchant: Hex;
  maxPerPeriod: Hex;
  spentThisPeriod: Hex;
  periodSeconds: bigint;
  lastReset: bigint;
};

const STORAGE_KEY_PREFIX = 'payme_sub_merchants_';

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

export default function SubscriptionsPage() {
    const { me } = useMe();
    const { cardAddress, hasCard, isLoading, isCreating, createCard } = usePrivateCard(me || null);
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
        const loadingToastId = toast.loading('Preparing encrypted subscription limit...');
        try {
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
                    args: [merchant as Hex, toHex(handles[0]), periodSeconds],
                }),
            };

            const userOp = await builder.buildUserOp({
                calls: [call],
                keyId: me.keyId,
            });

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
        } catch (error: any) {
            toast.error(error?.message || 'Failed to approve subscription.', { id: loadingToastId });
        } finally {
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
            <div className="flex-1 space-y-2 pt-1">
                <div className="flex items-center justify-between space-y-0 pb-1">
                    <h2 className="text-xl font-bold tracking-tight">Subscriptions</h2>
                    {hasCard && (
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size='icon' className='h-9 w-9' aria-label='Add subscription'>
                                    <IconPlus size={18} />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Subscription</DialogTitle>
                                    <DialogDescription>
                                        Approve a merchant with an encrypted max spend per billing period.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={onApprove} className='space-y-3'>
                                    <div className='space-y-1'>
                                        <Label htmlFor='merchant'>Merchant Address</Label>
                                        <Input
                                            id='merchant'
                                            placeholder='0x...'
                                            value={merchant}
                                            onChange={(e) => setMerchant(e.target.value)}
                                            disabled={isApproving}
                                        />
                                    </div>
                                    <div className='space-y-1'>
                                        <Label htmlFor='max'>Max Per Period (cUSDC)</Label>
                                        <Input
                                            id='max'
                                            placeholder='e.g. 20'
                                            value={maxPerPeriod}
                                            onChange={(e) => setMaxPerPeriod(e.target.value)}
                                            disabled={isApproving}
                                        />
                                    </div>
                                    <div className='space-y-1'>
                                        <Label htmlFor='period'>Period (days)</Label>
                                        <Input
                                            id='period'
                                            placeholder='30'
                                            value={periodDays}
                                            onChange={(e) => setPeriodDays(e.target.value)}
                                            disabled={isApproving}
                                        />
                                    </div>
                                    {isApproving && (
                                        <p className='text-xs text-muted-foreground'>
                                            Approving subscription on-chain. Please keep this window open.
                                        </p>
                                    )}
                                    <Button type='submit' disabled={isApproving} className='w-full'>
                                        {isApproving ? (
                                            <>
                                                <IconLoader2 size={14} className='animate-spin' />
                                                Approving...
                                            </>
                                        ) : (
                                            'Approve Subscription'
                                        )}
                                    </Button>
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
                                        <Card key={sub.merchant} className='transition-shadow hover:shadow-md'>
                                            <CardHeader className='pb-2'>
                                                <div className='flex items-center justify-between gap-2'>
                                                    <CardTitle className='font-mono text-xs'>{sub.merchant}</CardTitle>
                                                    <Badge variant={active ? 'default' : 'secondary'}>
                                                        {active ? 'Active' : 'Not set'}
                                                    </Badge>
                                                </div>
                                                <CardDescription>Billing period: {Number.isFinite(days) ? days : 0} day(s)</CardDescription>
                                            </CardHeader>
                                            <CardContent className='space-y-1 text-xs text-muted-foreground'>
                                                <p>Max per period handle: {sub.maxPerPeriod.slice(0, 10)}...</p>
                                                <p>Spent handle: {sub.spentThisPeriod.slice(0, 10)}...</p>
                                                <p>{relativeReset(sub.lastReset, sub.periodSeconds)}</p>
                                                <Button
                                                    size='sm'
                                                    variant='ghost'
                                                    className='mt-2 h-7 px-2 text-xs'
                                                    onClick={() => {
                                                        const next = trackedMerchants.filter((m) => m.toLowerCase() !== sub.merchant.toLowerCase());
                                                        persistTrackedMerchants(next);
                                                    }}
                                                >
                                                    Remove from list
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            ) : (
                                <div className='col-span-full rounded-xl border-2 border-dashed bg-muted/20 py-12 text-center'>
                                    <p className='italic text-muted-foreground'>
                                        {isRefreshing ? 'Loading subscriptions...' : 'No tracked subscriptions yet.'}
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
