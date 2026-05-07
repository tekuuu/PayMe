'use client';

import { useMemo, useState } from 'react';
import { encodeFunctionData, Hex, parseUnits, toHex } from 'viem';
import { CreditCard, Loader2, RefreshCcw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useMe } from '@/providers/auth-provider';
import { useFhevmContext } from '@/providers/fhevm-provider';
import { CHAIN, PRIVATE_CARD_ABI } from '@/config/constants';
import { smartWallet } from '@/lib/smart-wallet';
import { UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  beginBillingAttempt,
  finalizeBillingAttemptFailure,
  finalizeBillingAttemptSuccess,
  formatMicrosToCurrency,
} from '@/lib/merchant/control-plane-store';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';
import { BillingStatusBadge, FailureClassBadge, SubscriptionStatusBadge } from '@/components/merchant/status-badge';

export default function MerchantBillingCyclesPage() {
  const { me } = useMe();
  const { instance } = useFhevmContext();
  const {
    state,
    metrics,
    requestCycleRetry,
    setCycleUncollectible,
    refresh,
  } = useMerchantControlPlane(me?.account);

  const [customerCard, setCustomerCard] = useState('');
  const [amount, setAmount] = useState('');
  const [periodDays, setPeriodDays] = useState('30');
  const [loading, setLoading] = useState(false);
  const [dueLoading, setDueLoading] = useState(false);
  const [dueProgress, setDueProgress] = useState<string | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>('');

  const builder = useMemo(() => new UserOpBuilder(CHAIN), []);
  const sortedCycles = useMemo(
    () => [...(state?.cycles || [])].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [state?.cycles]
  );
  const availableSubscriptions = useMemo(
    () =>
      (state?.subscriptions || []).filter(
        (subscription) => subscription.status !== 'canceled' && subscription.status !== 'unpaid'
      ),
    [state?.subscriptions]
  );

  const plansById = useMemo(() => {
    const map = new Map<string, { billingIntervalSeconds: number; amountRefMicros: string; name: string }>();
    for (const plan of state?.plans || []) {
      map.set(plan.id, {
        billingIntervalSeconds: plan.billingIntervalSeconds,
        amountRefMicros: plan.amountRefMicros || '0',
        name: plan.name,
      });
    }
    return map;
  }, [state?.plans]);

  const selectedCycle = useMemo(() => {
    if (!selectedCycleId) return sortedCycles[0] || null;
    return sortedCycles.find((cycle) => cycle.id === selectedCycleId) || sortedCycles[0] || null;
  }, [selectedCycleId, sortedCycles]);

  const selectedCycleSubscription = useMemo(() => {
    if (!selectedCycle) return null;
    return state?.subscriptions.find((entry) => entry.id === selectedCycle.subscriptionId) || null;
  }, [selectedCycle, state?.subscriptions]);

  const selectedCycleAttempts = useMemo(() => {
    if (!selectedCycle) return [];
    return (state?.attempts || []).filter((attempt) => attempt.billingCycleId === selectedCycle.id);
  }, [selectedCycle, state?.attempts]);

  const dueAgreements = useMemo(() => {
    const now = Date.now();
    return availableSubscriptions
      .filter((subscription) => subscription.status !== 'paused' && !subscription.cancelAtPeriodEnd)
      .map((subscription) => {
        const plan = plansById.get(subscription.planId);
        const nextChargeAt = subscription.nextChargeAt || subscription.currentPeriodEnd;
        const dueAtMs = new Date(nextChargeAt).getTime();
        const amountRefMicros =
          (plan?.amountRefMicros && plan.amountRefMicros !== '0'
            ? plan.amountRefMicros
            : subscription.maxAllowanceRefMicros) || '0';
        return {
          subscription,
          plan,
          nextChargeAt,
          due: Number.isFinite(dueAtMs) && dueAtMs <= now,
          amountRefMicros,
        };
      })
      .filter((row) => row.due && row.amountRefMicros !== '0');
  }, [availableSubscriptions, plansById]);

  const handleRunDueCharges = async () => {
    if (!me?.account) {
      toast.error('Please sign in with merchant wallet');
      return;
    }
    if (!instance) {
      toast.error('FHE engine is not ready yet');
      return;
    }
    if (dueAgreements.length === 0) {
      toast.message('No due agreements found');
      return;
    }

    try {
      setDueLoading(true);
      smartWallet.init();

      for (let i = 0; i < dueAgreements.length; i++) {
        const row = dueAgreements[i];
        const subscription = row.subscription;
        const plan = row.plan;

        setDueProgress(`Charging ${i + 1}/${dueAgreements.length}: ${subscription.customerCardAddress.slice(0, 10)}...`);

        let attemptId: string | null = null;
        let userOpHash: string | undefined;

        try {
          const amountRaw = BigInt(row.amountRefMicros);
          const periodSeconds = BigInt(plan?.billingIntervalSeconds || 30 * 24 * 60 * 60);
          const idempotencyKey = `due:${subscription.id}:${subscription.currentPeriodEnd}:${row.amountRefMicros}`;

          const attemptContext = beginBillingAttempt({
            merchantAddress: me.account,
            customerCardAddress: subscription.customerCardAddress,
            customerSmartWallet: subscription.customerSmartWallet,
            requestedAmountRef: amountRaw.toString(),
            planName: plan?.name,
            periodSeconds: Number(periodSeconds),
            idempotencyKey,
          });
          attemptId = attemptContext.attemptId;

          let call: {
            dest: Hex;
            value: bigint;
            data: Hex;
          };

          if (subscription.subscriptionRef) {
            call = {
              dest: subscription.customerCardAddress as Hex,
              value: 0n,
              data: encodeFunctionData({
                abi: PRIVATE_CARD_ABI,
                functionName: 'chargeSubscriptionRefRenewal',
                args: [subscription.subscriptionRef as Hex],
              }),
            };
          } else {
            const encryptedInput = instance.createEncryptedInput(subscription.customerCardAddress, me.account as Hex);
            encryptedInput.add64(amountRaw);
            const { handles, inputProof } = await encryptedInput.encrypt();
            const inputProofHex = `0x${Array.from(inputProof).map((byte) => byte.toString(16).padStart(2, '0')).join('')}` as Hex;

            call = {
              dest: subscription.customerCardAddress as Hex,
              value: 0n,
              data: encodeFunctionData({
                abi: PRIVATE_CARD_ABI,
                functionName: 'pullSubscriptionWithProof',
                args: [toHex(handles[0], { size: 32 }), inputProofHex],
              }),
            };
          }

          const userOp = await builder.buildUserOp({
            calls: [call],
            keyId: me.keyId,
          });

          userOpHash = await smartWallet.sendUserOperation({ userOp });
          const receipt = await smartWallet.waitForUserOperationReceipt({ hash: userOpHash });
          if (!receipt || !receipt.success || receipt.receipt?.status !== '0x1') {
            throw new Error('On-chain execution failed');
          }

          finalizeBillingAttemptSuccess({
            merchantAddress: me.account,
            attemptId,
            userOpHash,
            txHash: receipt.receipt?.transactionHash as string | undefined,
            pulledAmountRef: amountRaw.toString(),
          });
        } catch (error: any) {
          const message = error?.message || 'Charge failed';
          if (attemptId) {
            finalizeBillingAttemptFailure({
              merchantAddress: me.account,
              attemptId,
              userOpHash,
              errorMessage: message,
            });
          }
        }
      }

      refresh();
      toast.success('Due charges run completed');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to run due charges');
    } finally {
      setDueProgress(null);
      setDueLoading(false);
    }
  };

  const handleCharge = async () => {
    if (!me?.account) {
      toast.error('Please sign in with merchant wallet');
      return;
    }
    if (!instance) {
      toast.error('FHE engine is not ready yet');
      return;
    }
    if (!customerCard || !amount) {
      toast.error('Provide customer card address and amount');
      return;
    }

    let attemptId: string | null = null;
    let userOpHash: string | undefined;

    try {
      setLoading(true);
      const amountRaw = parseUnits(amount, 6);
      const parsedPeriodDays = Number(periodDays || '30');
      const safePeriodDays =
        Number.isFinite(parsedPeriodDays) && parsedPeriodDays > 0 ? Math.floor(parsedPeriodDays) : 30;
      const periodSeconds = BigInt(safePeriodDays * 24 * 60 * 60);
      const attemptContext = beginBillingAttempt({
        merchantAddress: me.account,
        customerCardAddress: customerCard,
        requestedAmountRef: amountRaw.toString(),
        periodSeconds: Number(periodSeconds),
      });
      attemptId = attemptContext.attemptId;

      const loadedSubscription = availableSubscriptions.find((subscription) => subscription.id === selectedSubscriptionId);
      const selectedSubscriptionRef = loadedSubscription?.subscriptionRef;

      smartWallet.init();
      let call: {
        dest: Hex;
        value: bigint;
        data: Hex;
      };

      if (selectedSubscriptionRef) {
        call = {
          dest: customerCard as Hex,
          value: 0n,
          data: encodeFunctionData({
            abi: PRIVATE_CARD_ABI,
            functionName: 'chargeSubscriptionRefRenewal',
            args: [selectedSubscriptionRef as Hex],
          }),
        };
      } else {
        const encryptedInput = instance.createEncryptedInput(customerCard, me.account as Hex);
        encryptedInput.add64(amountRaw);
        const { handles, inputProof } = await encryptedInput.encrypt();
        const inputProofHex = `0x${Array.from(inputProof).map((byte) => byte.toString(16).padStart(2, '0')).join('')}` as Hex;

        call = {
          dest: customerCard as Hex,
          value: 0n,
          data: encodeFunctionData({
            abi: PRIVATE_CARD_ABI,
            functionName: 'pullSubscriptionWithProof',
            args: [toHex(handles[0], { size: 32 }), inputProofHex],
          }),
        };
      }

      const userOp = await builder.buildUserOp({
        calls: [call],
        keyId: me.keyId,
      });

      userOpHash = await smartWallet.sendUserOperation({ userOp });
      toast.success('User operation submitted', { description: userOpHash });
      const receipt = await smartWallet.waitForUserOperationReceipt({ hash: userOpHash });
      if (!receipt || !receipt.success || receipt.receipt?.status !== '0x1') {
        throw new Error('On-chain execution failed');
      }

      finalizeBillingAttemptSuccess({
        merchantAddress: me.account,
        attemptId: attemptContext.attemptId,
        userOpHash,
        txHash: receipt.receipt?.transactionHash as string | undefined,
        pulledAmountRef: amountRaw.toString(),
      });
      refresh();
      setCustomerCard('');
      setAmount('');
      toast.success('Billing pull confirmed');
    } catch (error: any) {
      const message = error?.message || 'Charge failed';
      if (attemptId && me?.account) {
        finalizeBillingAttemptFailure({
          merchantAddress: me.account,
          attemptId,
          userOpHash,
          errorMessage: message,
        });
        refresh();
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickSubscription = (subscriptionId: string) => {
    setSelectedSubscriptionId(subscriptionId);
    if (subscriptionId === '__manual__') {
      return;
    }

    const selected = availableSubscriptions.find((subscription) => subscription.id === subscriptionId);
    if (!selected) return;

    setCustomerCard(selected.customerCardAddress);
    const plan = plansById.get(selected.planId);
    const seconds = plan?.billingIntervalSeconds || 30 * 24 * 60 * 60;
    setPeriodDays(String(Math.max(1, Math.floor(seconds / 86400))));
    if (plan?.amountRefMicros && plan.amountRefMicros !== '0') {
      setAmount(formatMicrosToCurrency(plan.amountRefMicros));
    }
  };

  return (
    <div className='flex-1 space-y-6 p-6'>
      <div className='space-y-1'>
        <h2 className='text-2xl font-semibold tracking-tight text-foreground'>Billing Cycles</h2>
        <p className='text-sm text-muted-foreground'>
          Track and manage billing operations, monitor payment attempts, and control retry strategies with complete visibility.
        </p>
      </div>
      <div className='h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent' />

      <div className='grid gap-4 md:grid-cols-4'>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Open Cycles</p>
            <p className='text-3xl font-bold text-foreground tabular-nums'>{metrics?.cyclesOpen || 0}</p>
          </div>
        </div>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Failed Today</p>
            <p className='text-3xl font-bold text-foreground tabular-nums'>{metrics?.failedToday || 0}</p>
          </div>
        </div>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Paid Today</p>
            <p className='text-3xl font-bold text-foreground tabular-nums'>{metrics?.paidToday || 0}</p>
          </div>
        </div>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>MRR Proxy</p>
            <p className='text-2xl font-bold text-foreground tabular-nums'>{formatMicrosToCurrency(metrics?.mrrProxyMicros || 0n)}</p>
            <p className='text-xs text-muted-foreground'>cUSDC</p>
          </div>
        </div>
      </div>

      <div className='grid gap-6 xl:grid-cols-[1.1fr_1fr]'>
        <div className='space-y-4'>
          <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
            <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
            <div className='relative p-6 space-y-4'>
              <div>
                <h3 className='text-base font-semibold text-foreground'>Run Due Charges</h3>
                <p className='mt-1 text-xs text-muted-foreground'>Collect charges where the next charge date has passed.</p>
              </div>

              <div className='rounded-xl border border-border/40 bg-background/50 p-4 space-y-3'>
                <div className='flex items-center justify-between'>
                  <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Due agreements</p>
                  <span className='inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary'>
                    {dueAgreements.length}
                  </span>
                </div>
                {dueAgreements.length === 0 ? (
                  <p className='text-xs text-muted-foreground py-4 text-center'>No due charges right now.</p>
                ) : (
                  <div className='space-y-2 max-h-48 overflow-y-auto'>
                    {dueAgreements.slice(0, 6).map((row) => (
                      <div key={row.subscription.id} className='flex items-center justify-between gap-2 rounded-lg bg-muted/20 p-2.5 text-xs'>
                        <p className='font-mono text-muted-foreground'>{row.subscription.customerCardAddress.slice(0, 10)}...</p>
                        <div className='text-right'>
                          <p className='font-semibold text-foreground tabular-nums'>{formatMicrosToCurrency(row.amountRefMicros)}</p>
                          <p className='text-[10px] text-muted-foreground'>{new Date(row.nextChargeAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                    {dueAgreements.length > 6 ? (
                      <p className='text-[11px] text-muted-foreground text-center pt-2'>+ {dueAgreements.length - 6} more</p>
                    ) : null}
                  </div>
                )}
              </div>

              {dueProgress ? (
                <div className='flex items-center gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground'>
                  <Loader2 className='h-3.5 w-3.5 animate-spin flex-shrink-0' />
                  <span>{dueProgress}</span>
                </div>
              ) : null}

              <Button
                onClick={handleRunDueCharges}
                disabled={dueLoading || !instance || !me?.account || dueAgreements.length === 0}
                className='w-full gap-2'
              >
                {dueLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <CreditCard className='h-4 w-4' />}
                Run Due Charges
              </Button>
            </div>
          </div>

          <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
            <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
            <div className='relative p-6 space-y-4'>
              <div>
                <h3 className='text-base font-semibold text-foreground'>Run Manual Billing</h3>
                <p className='mt-1 text-xs text-muted-foreground'>Manually charge a customer card.</p>
              </div>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Load Existing Subscription (Optional)</label>
                  <Select value={selectedSubscriptionId} onValueChange={handlePickSubscription}>
                    <SelectTrigger className='rounded-xl'>
                      <SelectValue placeholder='Manual entry' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='__manual__'>Manual entry</SelectItem>
                      {availableSubscriptions.map((subscription) => (
                        <SelectItem key={subscription.id} value={subscription.id}>
                          {`${subscription.status.toUpperCase()} \u00B7 ${subscription.customerCardAddress.slice(0, 8)}...${subscription.customerCardAddress.slice(-4)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Customer Card Address</label>
                  <Input
                    value={customerCard}
                    onChange={(event) => setCustomerCard(event.target.value.trim())}
                    placeholder='0x...'
                    className='rounded-xl'
                  />
                </div>

                <div className='grid gap-3 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Amount (cUSDC)</label>
                    <Input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      type='number'
                      placeholder='5.00'
                      min='0'
                      step='0.000001'
                      className='rounded-xl'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Billing Period (days)</label>
                    <Input
                      value={periodDays}
                      onChange={(event) => setPeriodDays(event.target.value)}
                      type='number'
                      min='1'
                      className='rounded-xl'
                    />
                  </div>
                </div>

                <Button onClick={handleCharge} disabled={loading || !instance || !me?.account} className='w-full gap-2'>
                  {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <CreditCard className='h-4 w-4' />}
                  Submit Billing Attempt
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 space-y-4'>
            <div>
              <h3 className='text-base font-semibold text-foreground'>Cycle Details</h3>
              <p className='mt-1 text-xs text-muted-foreground'>
                Select a cycle to inspect attempts and operator controls.
              </p>
            </div>

            <div className='space-y-3'>
              <Select value={selectedCycle?.id || ''} onValueChange={(value) => setSelectedCycleId(value || null)}>
                <SelectTrigger className='rounded-xl'>
                  <SelectValue placeholder={sortedCycles.length === 0 ? 'No cycles yet' : undefined} />
                </SelectTrigger>
                <SelectContent>
                  {sortedCycles.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id}>
                      {`${cycle.status.toUpperCase()} \u00B7 ${cycle.id.slice(-6)} \u00B7 ${new Date(cycle.createdAt).toLocaleDateString()}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCycle ? (
                <div className='rounded-xl border border-border/40 bg-background/50 p-4 space-y-3'>
                  <div className='flex items-center justify-between gap-2 flex-wrap'>
                    <BillingStatusBadge status={selectedCycle.status} />
                    {selectedCycleSubscription ? <SubscriptionStatusBadge status={selectedCycleSubscription.status} /> : null}
                  </div>
                  <div className='space-y-2 text-xs text-muted-foreground'>
                    <div className='flex justify-between'>
                      <span>Attempts:</span>
                      <span className='font-semibold text-foreground'>{selectedCycle.attemptCount}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Next retry:</span>
                      <span className='font-semibold text-foreground'>
                        {selectedCycle.nextAttemptAt ? new Date(selectedCycle.nextAttemptAt).toLocaleString() : 'Not scheduled'}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Period end:</span>
                      <span className='font-semibold text-foreground'>{new Date(selectedCycle.cycleEnd).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className='flex gap-2 pt-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex-1 gap-1'
                      onClick={() => requestCycleRetry(selectedCycle.id)}
                    >
                      <RefreshCcw className='h-3.5 w-3.5' />
                      Retry
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      className='flex-1 gap-1'
                      onClick={() => setCycleUncollectible(selectedCycle.id)}
                    >
                      <ShieldAlert className='h-3.5 w-3.5' />
                      Uncollectible
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='rounded-xl border border-dashed border-border/40 bg-background/30 p-6 text-center text-xs text-muted-foreground'>
                  Run your first billing attempt to create a cycle.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur overflow-hidden'>
        <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
        <div className='p-6 border-b border-border/40'>
          <h3 className='text-base font-semibold text-foreground'>Billing Cycle Ledger</h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='border-b border-border/40 bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 font-semibold'>Cycle</th>
                <th className='px-4 py-3 font-semibold'>Subscription</th>
                <th className='px-4 py-3 font-semibold'>Status</th>
                <th className='px-4 py-3 font-semibold'>Attempts</th>
                <th className='px-4 py-3 font-semibold'>Failure Class</th>
                <th className='px-4 py-3 font-semibold'>Next Retry</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/30'>
              {sortedCycles.length === 0 ? (
                <tr>
                  <td className='px-4 py-8 text-center text-muted-foreground' colSpan={6}>
                    No cycle records yet.
                  </td>
                </tr>
              ) : (
                sortedCycles.map((cycle) => (
                  <tr
                    key={cycle.id}
                    className='cursor-pointer hover:bg-muted/40 transition-colors'
                    onClick={() => setSelectedCycleId(cycle.id)}
                  >
                    <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>{cycle.id.slice(-12)}</td>
                    <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>{cycle.subscriptionId.slice(-10)}</td>
                    <td className='px-4 py-3'>
                      <BillingStatusBadge status={cycle.status} />
                    </td>
                    <td className='px-4 py-3 text-sm font-semibold'>{cycle.attemptCount}</td>
                    <td className='px-4 py-3'>
                      {cycle.lastFailureClass ? <FailureClassBadge failureClass={cycle.lastFailureClass} /> : <span className='text-muted-foreground text-xs'>—</span>}
                    </td>
                    <td className='px-4 py-3 text-xs text-muted-foreground'>
                      {cycle.nextAttemptAt ? new Date(cycle.nextAttemptAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCycle && selectedCycleAttempts.length > 0 ? (
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 space-y-4'>
            <h3 className='text-base font-semibold text-foreground'>Attempt Timeline</h3>
            <div className='space-y-2'>
              {selectedCycleAttempts.map((attempt) => (
                <div key={attempt.id} className='rounded-xl border border-border/40 bg-background/50 p-4 text-xs space-y-2'>
                  <div className='flex items-center justify-between gap-3'>
                    <p className='font-medium text-foreground'>Attempt #{attempt.attemptNumber} • {attempt.status}</p>
                    <p className='text-muted-foreground text-[11px]'>{new Date(attempt.startedAt).toLocaleString()}</p>
                  </div>
                  <p className='text-muted-foreground tabular-nums'>Requested: <span className='text-foreground font-semibold'>{formatMicrosToCurrency(attempt.requestedAmountRef)} cUSDC</span></p>
                  {attempt.failureClass ? (
                    <p className='text-rose-600 text-xs'>{attempt.failureClass.replaceAll('_', ' ')} {attempt.failureReason ? ` · ${attempt.failureReason}` : ''}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
