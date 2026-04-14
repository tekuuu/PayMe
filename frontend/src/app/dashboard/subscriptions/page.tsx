'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { encodeFunctionData, getAddress, Hex, parseUnits, toHex } from 'viem';
import { Loader2, ShieldCheck, XCircle } from 'lucide-react';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision, selectedCardAddress]);

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
            <ShieldCheck className='h-16 w-16 text-primary/40' />
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
    <PageContainer scrollable pageTitle='Subscriptions' pageDescription='Your approved merchant plans and encrypted allowances.'>
      <div className='flex-1 space-y-4 pt-2 px-2 md:px-6'>
        <div className='rounded-xl border bg-card p-4 shadow-sm'>
          <p className='text-sm text-muted-foreground'>
            Have a new checkout link? Open it and approve with your card. Example: <code className='rounded bg-muted px-1.5 py-0.5'>/subscribe/...</code>
          </p>
        </div>

        <div className='rounded-xl border bg-card shadow-sm'>
          <div className='p-4 flex items-center justify-between gap-3'>
            <div>
              <h3 className='font-semibold'>My Subscriptions</h3>
              <p className='text-xs text-muted-foreground'>This is a local UI ledger until the DB/scheduler lands.</p>
            </div>
            <p className='text-xs text-muted-foreground'>Card: {selectedCardAddress ? shortAddress(selectedCardAddress) : '-'}</p>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='border-y bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground'>
                <tr>
                  <th className='px-4 py-3 font-medium'>Merchant</th>
                  <th className='px-4 py-3 font-medium'>Plan</th>
                  <th className='px-4 py-3 font-medium'>Status</th>
                  <th className='px-4 py-3 font-medium'>Next Charge</th>
                  <th className='px-4 py-3 font-medium'>Allowance</th>
                  <th className='px-4 py-3 font-medium'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {rows.length === 0 ? (
                  <tr>
                    <td className='px-4 py-8 text-center text-muted-foreground' colSpan={6}>
                      No subscriptions yet. Approve from a merchant checkout link.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={`${row.merchantAddress}:${row.subscriptionId}`} className='align-top'>
                      <td className='px-4 py-3'>
                        <div className='font-mono text-xs'>{shortAddress(row.merchantAddress)}</div>
                        <div className='mt-1 text-[11px] text-muted-foreground'>{row.merchantAddress}</div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='font-medium'>{row.planName}</div>
                        <div className='mt-1 text-[11px] text-muted-foreground capitalize'>{row.planInterval}</div>
                      </td>
                      <td className='px-4 py-3'>
                        <SubscriptionStatusBadge status={row.status as any} />
                        {row.cancelAtPeriodEnd ? (
                          <div className='mt-1 text-[11px] text-muted-foreground'>Cancel at period end</div>
                        ) : null}
                      </td>
                      <td className='px-4 py-3 text-xs'>{new Date(row.nextChargeAt).toLocaleString()}</td>
                      <td className='px-4 py-3 text-xs text-muted-foreground'>
                        {formatMicrosToCurrency(row.maxAllowanceRefMicros)} cUSDC
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex flex-wrap gap-2'>
                          <Button size='sm' variant='outline' onClick={() => openAllowanceDialog(row)} disabled={isSubmitting}>
                            Update Allowance
                          </Button>
                          {row.cancelAtPeriodEnd ? (
                            <Button
                              size='sm'
                              variant='secondary'
                              onClick={() => handleCancelAtPeriodEnd(row, false)}
                              disabled={isSubmitting}
                            >
                              Undo Cancel
                            </Button>
                          ) : (
                            <Button
                              size='sm'
                              variant='secondary'
                              onClick={() => handleCancelAtPeriodEnd(row, true)}
                              disabled={isSubmitting}
                            >
                              Cancel End-Period
                            </Button>
                          )}
                          <Button
                            size='sm'
                            variant='destructive'
                            className='gap-1'
                            onClick={() => handleCancelNow(row)}
                            disabled={isSubmitting}
                          >
                            <XCircle className='h-3.5 w-3.5' />
                            Cancel Now
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className='p-4 text-xs text-muted-foreground'>
            Merchant links live at <code className='rounded bg-muted px-1.5 py-0.5'>/subscribe/[checkoutSlug]</code>. If you need one, ask the merchant.
          </div>
        </div>

        <div className='rounded-xl border bg-card p-4 shadow-sm'>
          <p className='text-sm text-muted-foreground'>
            Merchant portal lives at <Link href='/merchant' className='underline'>/merchant</Link> (business wallets only).
          </p>
        </div>
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
    </PageContainer>
  );
}
