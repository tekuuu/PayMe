'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { encodeFunctionData, getAddress, Hex, parseUnits, toHex } from 'viem';
import { Copy, Search, ChevronDown, ChevronUp, Wallet, CreditCard, Calendar, DollarSign, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SmartWalletOnboarding from '@/components/auth/smart-wallet-onboarding';
import { CreateCardEmptyState } from '@/components/smart-wallet/create-card-empty-state';
import { SubscriptionStatusBadge } from '@/components/merchant/status-badge';
import { useMe } from '@/providers/auth-provider';
import { useFhevmContext } from '@/providers/fhevm-provider';
import { usePrivateCard } from '@/hooks/use-private-card';
import { CHAIN, PRIVATE_CARD_ABI, PUBLIC_CLIENT } from '@/config/constants';
import { smartWallet } from '@/lib/smart-wallet';
import { describeExecutionRevertReason } from '@/lib/smart-wallet/revert-decode';
import { UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import {
  MERCHANT_CONTROL_PLANE_EVENT,
  cancelSubscription,
  formatMicrosToCurrency,
  listMerchantsForCustomerCard,
  readMerchantState,
  registerSubscriptionApproval,
  setSubscriptionCancelAtPeriodEnd,
  updateSubscriptionAllowance,
} from '@/lib/merchant/control-plane-store';
import type { SubscriptionStatus } from '@/lib/merchant/types';

function shortAddress(address: string) {
  if (!address) return '-';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

type MySubscriptionRow = {
  merchantAddress: Hex;
  subscriptionId: string;
  subscriptionRef?: Hex;
  planRef?: Hex;
  customerCardAddress: Hex;
  status: string;
  cancelAtPeriodEnd: boolean;
  nextChargeAt: string;
  planName: string;
  planInterval: string;
  periodSeconds: number;
  amountRefMicros: string;
  maxAllowanceRefMicros: string;
};

function copyText(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied`);
}

function formatUserOpExecutionError(receipt: any, fallback: string) {
  const rawReason =
    receipt?.receipt?.revertReason ||
    receipt?.reason ||
    receipt?.error ||
    receipt?.message;
  const reason = describeExecutionRevertReason(rawReason);

  if (reason && String(reason).trim().length > 0) {
    return `${fallback} Reason: ${String(reason)}`;
  }

  return fallback;
}

function SubscriptionCard({
  row,
  onUpdateAllowance,
  onCancelAtPeriodEnd,
  onCancelNow,
  isSubmitting,
}: {
  row: MySubscriptionRow;
  onUpdateAllowance: () => void;
  onCancelAtPeriodEnd: (enabled: boolean) => void;
  onCancelNow: () => void;
  isSubmitting: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState<'cancel-period' | 'cancel-now' | null>(null);
  const isCanceled = row.status === 'canceled';
  const seconds = row.periodSeconds || 30 * 86400;
  const days = Math.round(seconds / 86400);

  const handleConfirmPeriod = () => {
    onCancelAtPeriodEnd(!row.cancelAtPeriodEnd);
    setShowConfirmDialog(null);
  };

  const handleConfirmNow = () => {
    onCancelNow();
    setShowConfirmDialog(null);
  };

  return (
    <div className={`rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur overflow-hidden transition-all relative overflow-hidden group ${isCanceled ? 'opacity-70' : ''}`}>
      <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
      {/* Header */}
      <div className='relative px-6 py-4 space-y-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <SubscriptionStatusBadge status={row.status as SubscriptionStatus} />
              {row.cancelAtPeriodEnd && (
                <span className='inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600'>
                  <AlertCircle className='h-3 w-3' />
                  Cancels end-period
                </span>
              )}
            </div>
            <h3 className='text-base font-semibold text-foreground'>{row.planName}</h3>
            <p className='text-xs text-muted-foreground capitalize'>{row.planInterval} · {days} days</p>
          </div>

          <div className='text-right'>
            <p className='text-2xl font-bold text-foreground tabular-nums'>
              ${formatMicrosToCurrency(row.maxAllowanceRefMicros)}
            </p>
            <p className='text-xs text-muted-foreground'>per cycle</p>
          </div>
        </div>

        {/* Info row */}
        <div className='flex flex-col gap-2 rounded-xl border border-border/40 bg-background/50 p-3'>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Wallet className='h-3.5 w-3.5 flex-shrink-0' />
            <span className='font-mono'>{shortAddress(row.merchantAddress)}</span>
            <button
              onClick={() => copyText(row.merchantAddress, 'Merchant')}
              className='p-0.5 text-muted-foreground/60 hover:text-foreground transition-colors'
            >
              <Copy size={12} />
            </button>
          </div>
          <div className='flex items-center gap-2 text-xs text-muted-foreground pt-1'>
            <Calendar className='h-3.5 w-3.5 flex-shrink-0' />
            <span>Next: {new Date(row.nextChargeAt).toLocaleDateString()}</span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className='w-full flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/40'
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className='border-t border-border/40 bg-background/50 p-6 space-y-4'>
          {/* Period info */}
          <div className='grid grid-cols-3 gap-3'>
            <div className='rounded-xl border border-border/40 bg-card/50 p-3'>
              <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Plan</p>
              <p className='mt-2 text-sm font-semibold text-foreground capitalize'>{row.planInterval}</p>
            </div>
            <div className='rounded-xl border border-border/40 bg-card/50 p-3'>
              <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Cycle</p>
              <p className='mt-2 text-sm font-semibold text-foreground tabular-nums'>{days} days</p>
            </div>
            <div className='rounded-xl border border-border/40 bg-card/50 p-3'>
              <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Max</p>
              <p className='mt-2 text-sm font-semibold text-foreground tabular-nums'>${formatMicrosToCurrency(row.maxAllowanceRefMicros)}</p>
            </div>
          </div>

          {/* On-chain ref */}
          {row.subscriptionRef && (
            <div className='flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40'>
              <CreditCard className='h-4 w-4 text-muted-foreground flex-shrink-0' />
              <div>
                <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>On-Chain Ref</p>
                <p className='text-xs font-mono mt-1 text-foreground'>{row.subscriptionRef}</p>
              </div>
              <button onClick={() => copyText(row.subscriptionRef!, 'Ref')} className='ml-auto p-1 text-muted-foreground/60 hover:text-foreground transition-colors'>
                <Copy size={12} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className='flex flex-wrap items-center gap-2 pt-4 border-t border-border/40'>
            <Button size='sm' variant='outline' onClick={onUpdateAllowance} className='flex-1'>
              Update Allowance
            </Button>
            <Button size='sm' variant='secondary' onClick={() => setShowConfirmDialog('cancel-period')} disabled={isSubmitting} className='flex-1'>
              {row.cancelAtPeriodEnd ? 'Undo Cancel' : 'Cancel at End'}
            </Button>
            <Button size='sm' variant='destructive' onClick={() => setShowConfirmDialog('cancel-now')} disabled={isSubmitting} className='flex-1'>
              <XCircle className='h-3.5 w-3.5 mr-1' />Cancel Now
            </Button>
          </div>
        </div>
      )}

      {showConfirmDialog === 'cancel-period' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='mx-4 w-full max-w-sm rounded-xl border border-border/60 bg-card p-6'>
            <h3 className='text-lg font-semibold'>Cancel at Period End?</h3>
            <p className='mt-2 text-sm text-muted-foreground'>You'll stop being charged after this billing period ends.</p>
            <div className='mt-6 flex gap-3'>
              <Button variant='outline' className='flex-1' onClick={() => setShowConfirmDialog(null)}>Keep</Button>
              <Button variant='destructive' className='flex-1' onClick={handleConfirmPeriod}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDialog === 'cancel-now' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='mx-4 w-full max-w-sm rounded-xl border border-border/60 bg-card p-6'>
            <h3 className='text-lg font-semibold text-rose-600'>Cancel Immediately?</h3>
            <p className='mt-2 text-sm text-muted-foreground'>This will cancel your subscription right now.</p>
            <div className='mt-6 flex gap-3'>
              <Button variant='outline' className='flex-1' onClick={() => setShowConfirmDialog(null)}>Keep</Button>
              <Button variant='destructive' className='flex-1' onClick={handleConfirmNow}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionsPage() {
  const { me } = useMe();
  const { instance } = useFhevmContext();
  const {
    selectedCardAddress,
    hasCard,
    isCreating,
    createCard,
  } = usePrivateCard(me || null);
  const builder = useMemo(() => new UserOpBuilder(CHAIN), []);

  const [revision, setRevision] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRow, setEditingRow] = useState<MySubscriptionRow | null>(null);
  const [newAllowance, setNewAllowance] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bump = () => setRevision((v) => v + 1);
    const onMerchantEvent = () => bump();
    const onStorage = (event: StorageEvent) => {
      if (!event.key) return;
      if (event.key.startsWith('payme.merchant.control-plane.') || event.key.startsWith('payme.customer.cardSubscriptions.')) {
        bump();
      }
    };
    window.addEventListener(MERCHANT_CONTROL_PLANE_EVENT, onMerchantEvent as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(MERCHANT_CONTROL_PLANE_EVENT, onMerchantEvent as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const rows = useMemo(() => {
    if (!selectedCardAddress) return [] as MySubscriptionRow[];
    const merchants = listMerchantsForCustomerCard(selectedCardAddress);
    const result: MySubscriptionRow[] = [];

    for (const merchantAddress of merchants) {
      const state = readMerchantState(merchantAddress);
      const sub = (state.subscriptions || []).find(
        (entry) => entry.customerCardAddress?.toLowerCase() === selectedCardAddress.toLowerCase()
      );
      if (!sub) continue;

      const plan = (state.plans || []).find((p) => p.id === sub.planId);
      const amountRefMicros = plan?.amountRefMicros || sub.maxAllowanceRefMicros || '0';
      const periodSeconds = plan?.billingIntervalSeconds || 30 * 24 * 60 * 60;

      result.push({
        merchantAddress: merchantAddress as Hex,
        subscriptionId: sub.id,
        subscriptionRef: sub.subscriptionRef as Hex | undefined,
        planRef: sub.planRef as Hex | undefined,
        customerCardAddress: sub.customerCardAddress as Hex,
        status: sub.status,
        cancelAtPeriodEnd: !!sub.cancelAtPeriodEnd,
        nextChargeAt: sub.nextChargeAt || sub.currentPeriodEnd,
        planName: plan?.name || 'Plan',
        planInterval: plan?.interval || 'custom',
        periodSeconds,
        amountRefMicros: amountRefMicros,
        maxAllowanceRefMicros: sub.maxAllowanceRefMicros || amountRefMicros,
      });
    }

    return result.sort((a, b) => b.nextChargeAt.localeCompare(a.nextChargeAt));
  }, [revision, selectedCardAddress]);

  const stats = useMemo(() => {
    return {
      total: rows.length,
      active: rows.filter((r) => r.status === 'active').length,
      pastDue: rows.filter((r) => r.status === 'past_due').length,
      paused: rows.filter((r) => r.status === 'paused').length,
      canceled: rows.filter((r) => r.status === 'canceled').length,
    };
  }, [rows]);

  const openAllowanceDialog = (row: MySubscriptionRow) => {
    setEditingRow(row);
    try {
      setNewAllowance(formatMicrosToCurrency(row.maxAllowanceRefMicros));
    } catch {
      setNewAllowance('');
    }
  };

  const approveOnChain = async (args: {
    merchantAddress: Hex;
    planRef: Hex;
    subscriptionRef: Hex;
    maxPerPeriodMicros: string;
    periodSeconds: number;
  }) => {
    if (!me) throw new Error('Please login first');
    if (!selectedCardAddress) throw new Error('No private card selected');
    if (!instance) throw new Error('Crypto engine not ready');

    const cardOwner = (await PUBLIC_CLIENT.readContract({
      address: selectedCardAddress as Hex,
      abi: PRIVATE_CARD_ABI,
      functionName: 'owner',
    })) as Hex;

    const signingAccount = getAddress(cardOwner) as Hex;
    const amountRaw = BigInt(args.maxPerPeriodMicros);
    const encryptedInput = instance.createEncryptedInput(selectedCardAddress, signingAccount);
    encryptedInput.add64(amountRaw);
    const { handles, inputProof } = await encryptedInput.encrypt();
    const inputProofHex = `0x${Array.from(inputProof).map((byte) => byte.toString(16).padStart(2, '0')).join('')}` as Hex;

    smartWallet.init();
    const call = {
      dest: selectedCardAddress as Hex,
      value: 0n,
      data: encodeFunctionData({
        abi: PRIVATE_CARD_ABI,
        functionName: 'approveSubscriptionRefWithProof',
        args: [
          args.merchantAddress,
          args.planRef,
          args.subscriptionRef,
          toHex(handles[0], { size: 32 }),
          inputProofHex,
          BigInt(args.periodSeconds),
        ],
      }),
    };

    const userOp = await builder.buildUserOp({
      calls: [call],
      keyId: me.keyId,
      sender: signingAccount,
      publicKey: [BigInt(me.pubKey.x), BigInt(me.pubKey.y)],
    });

    const hash = await smartWallet.sendUserOperation({ userOp });
    const receipt = await smartWallet.waitForUserOperationReceipt({ hash });
    if (!receipt || receipt.success === false || receipt.receipt?.status !== '0x1') {
      throw new Error(formatUserOpExecutionError(receipt, 'On-chain approval failed'));
    }

    return toHex(handles[0], { size: 32 });
  };

  const handleCancelAtPeriodEnd = (row: MySubscriptionRow, enabled: boolean) => {
    if (!row.subscriptionRef) {
      toast.error('Missing subscription reference, please resubscribe from checkout link');
      return;
    }

    const run = async () => {
      if (!me) throw new Error('Please login first');
      if (!selectedCardAddress) throw new Error('No private card selected');

      const cardOwner = (await PUBLIC_CLIENT.readContract({
        address: selectedCardAddress as Hex,
        abi: PRIVATE_CARD_ABI,
        functionName: 'owner',
      })) as Hex;

      const signingAccount = getAddress(cardOwner) as Hex;

      smartWallet.init();
      const call = {
        dest: selectedCardAddress as Hex,
        value: 0n,
        data: encodeFunctionData({
          abi: PRIVATE_CARD_ABI,
          functionName: 'setSubscriptionRefCancelAtPeriodEnd',
          args: [row.subscriptionRef as Hex, enabled],
        }),
      };

      const userOp = await builder.buildUserOp({
        calls: [call],
        keyId: me.keyId,
        sender: signingAccount,
        publicKey: [BigInt(me.pubKey.x), BigInt(me.pubKey.y)],
      });

      const hash = await smartWallet.sendUserOperation({ userOp });
      const receipt = await smartWallet.waitForUserOperationReceipt({ hash });
      if (!receipt || receipt.success === false || receipt.receipt?.status !== '0x1') {
        throw new Error(formatUserOpExecutionError(receipt, 'Failed to update cancellation schedule'));
      }
    };

    const commit = async () => {
      try {
        setIsSubmitting(true);
        await run();
        setSubscriptionCancelAtPeriodEnd(row.merchantAddress, row.subscriptionId, enabled);
        toast.success(enabled ? 'Cancellation scheduled' : 'Cancellation removed');
      } catch (e: any) {
        toast.error(e?.message || 'Failed to update cancellation schedule');
      } finally {
        setIsSubmitting(false);
      }
    };

    void commit();
  };

  const handleCancelNow = async (row: MySubscriptionRow) => {
    if (!row.subscriptionRef) {
      toast.error('Missing opaque subscription reference, please resubscribe from checkout link');
      return;
    }
    try {
      setIsSubmitting(true);

      if (!me) throw new Error('Please login first');
      if (!selectedCardAddress) throw new Error('No private card selected');

      const cardOwner = (await PUBLIC_CLIENT.readContract({
        address: selectedCardAddress as Hex,
        abi: PRIVATE_CARD_ABI,
        functionName: 'owner',
      })) as Hex;

      const signingAccount = getAddress(cardOwner) as Hex;

      smartWallet.init();
      const call = {
        dest: selectedCardAddress as Hex,
        value: 0n,
        data: encodeFunctionData({
          abi: PRIVATE_CARD_ABI,
          functionName: 'cancelSubscriptionRef',
          args: [row.subscriptionRef as Hex],
        }),
      };

      const userOp = await builder.buildUserOp({
        calls: [call],
        keyId: me.keyId,
        sender: signingAccount,
        publicKey: [BigInt(me.pubKey.x), BigInt(me.pubKey.y)],
      });

      const hash = await smartWallet.sendUserOperation({ userOp });
      const receipt = await smartWallet.waitForUserOperationReceipt({ hash });
      if (!receipt || receipt.success === false || receipt.receipt?.status !== '0x1') {
        throw new Error(formatUserOpExecutionError(receipt, 'On-chain cancellation failed'));
      }

      cancelSubscription(row.merchantAddress, row.subscriptionId, false);
      toast.success('Canceled on-chain');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to cancel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAllowance = async () => {
    if (!editingRow) return;
    if (!editingRow.subscriptionRef || !editingRow.planRef) {
      toast.error('Missing opaque subscription reference, please resubscribe from checkout link');
      return;
    }
    if (!newAllowance || Number(newAllowance) <= 0) {
      toast.error('Allowance must be greater than zero');
      return;
    }

    try {
      setIsSubmitting(true);
      const amountMicros = parseUnits(String(newAllowance), 6).toString();
      const handle = await approveOnChain({
        merchantAddress: editingRow.merchantAddress,
        planRef: editingRow.planRef,
        subscriptionRef: editingRow.subscriptionRef,
        maxPerPeriodMicros: amountMicros,
        periodSeconds: editingRow.periodSeconds,
      });

      updateSubscriptionAllowance({
        merchantAddress: editingRow.merchantAddress,
        subscriptionId: editingRow.subscriptionId,
        amountRefMicros: amountMicros,
        amountHandle: handle,
      });

      registerSubscriptionApproval({
        merchantAddress: editingRow.merchantAddress,
        customerCardAddress: editingRow.customerCardAddress,
        customerSmartWallet: me?.account,
        planRef: editingRow.planRef,
        subscriptionRef: editingRow.subscriptionRef,
        amountRef: amountMicros,
        amountHandle: handle,
        periodSeconds: editingRow.periodSeconds,
        planName: editingRow.planName,
      });

      toast.success('Allowance updated');
      setEditingRow(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update allowance');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!me) {
    return (
      <PageContainer>
        <div className='flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center'>
          <div className='p-6 bg-primary/5 rounded-full animate-pulse'>
            <CreditCard className='h-16 w-16 text-primary/40' />
          </div>
          <div className='space-y-2 max-w-sm'>
            <h2 className='text-2xl font-bold tracking-tight text-foreground'>Subscriptions Locked</h2>
            <p className='text-muted-foreground text-sm'>Access requires a Passkey-secured Smart Wallet.</p>
          </div>
          <SmartWalletOnboarding variant='default' className='w-full max-w-[200px]' />
        </div>
      </PageContainer>
    );
  }

  if (!hasCard) {
    return (
      <PageContainer scrollable>
        <CreateCardEmptyState onCreate={() => createCard()} isCreating={isCreating} />
      </PageContainer>
    );
  }

  return (
    <div className='flex-1 space-y-6 p-6'>
      <div className='space-y-1'>
        <h2 className='text-sm font-bold uppercase tracking-[0.22em] text-foreground sm:text-base'>Subscriptions</h2>
      </div>
      <div className='h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent' />

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4'>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Total</p>
            <p className='text-3xl font-bold text-foreground tabular-nums'>{stats.total}</p>
          </div>
        </div>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Active</p>
            <p className='text-3xl font-bold text-foreground tabular-nums'>{stats.active}</p>
          </div>
        </div>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Past Due</p>
            <p className='text-3xl font-bold text-foreground tabular-nums'>{stats.pastDue}</p>
          </div>
        </div>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Paused</p>
            <p className='text-3xl font-bold text-foreground tabular-nums'>{stats.paused}</p>
          </div>
        </div>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Canceled</p>
            <p className='text-3xl font-bold text-foreground tabular-nums'>{stats.canceled}</p>
          </div>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        {rows.length === 0 ? (
          <div className='col-span-full rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur p-8 text-center text-muted-foreground'>
            No subscriptions yet. Approve from a merchant checkout link.
          </div>
        ) : (
          rows.map((row) => (
            <SubscriptionCard
              key={`${row.merchantAddress}:${row.subscriptionId}`}
              row={row}
              onUpdateAllowance={() => openAllowanceDialog(row)}
              onCancelAtPeriodEnd={(enabled) => handleCancelAtPeriodEnd(row, enabled)}
              onCancelNow={() => handleCancelNow(row)}
              isSubmitting={isSubmitting}
            />
          ))
        )}
      </div>

      <Dialog open={!!editingRow} onOpenChange={(open) => (!open ? setEditingRow(null) : null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Update Allowance</DialogTitle>
            <DialogDescription>Updates your encrypted per-period max. This submits an on-chain approval transaction.</DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Max Allowance (cUSDC)</Label>
              <Input
                value={newAllowance}
                onChange={(e) => setNewAllowance(e.target.value)}
                type='number'
                min='0'
                step='0.000001'
              />
            </div>
            <div className='flex items-center justify-end gap-2'>
              <Button variant='outline' onClick={() => setEditingRow(null)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSaveAllowance} disabled={isSubmitting || !instance} className='gap-2'>
                {isSubmitting ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
