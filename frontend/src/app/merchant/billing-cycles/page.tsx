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
      .filter((subscription) => subscription.status !== 'paused')
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

          const encryptedInput = instance.createEncryptedInput(subscription.customerCardAddress, me.account as Hex);
          encryptedInput.add64(amountRaw);
          const { handles } = await encryptedInput.encrypt();

          const call = {
            dest: subscription.customerCardAddress as Hex,
            value: 0n,
            data: encodeFunctionData({
              abi: PRIVATE_CARD_ABI,
              functionName: subscription.subscriptionRef ? 'pullSubscriptionRef' : 'pullSubscription',
              args: subscription.subscriptionRef
                ? [subscription.subscriptionRef as Hex, toHex(handles[0], { size: 32 })]
                : [toHex(handles[0], { size: 32 })],
            }),
          };

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

      const encryptedInput = instance.createEncryptedInput(customerCard, me.account as Hex);
      encryptedInput.add64(amountRaw);
      const { handles } = await encryptedInput.encrypt();
      const loadedSubscription = availableSubscriptions.find((subscription) => subscription.id === selectedSubscriptionId);
      const selectedSubscriptionRef = loadedSubscription?.subscriptionRef;

      smartWallet.init();
      const call = {
        dest: customerCard as Hex,
        value: 0n,
        data: encodeFunctionData({
          abi: PRIVATE_CARD_ABI,
          functionName: selectedSubscriptionRef ? 'pullSubscriptionRef' : 'pullSubscription',
          args: selectedSubscriptionRef
            ? [selectedSubscriptionRef as Hex, toHex(handles[0], { size: 32 })]
            : [toHex(handles[0], { size: 32 })],
        }),
      };

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
    if (!subscriptionId) {
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
    <div className='flex-1 space-y-6 p-8 pt-6'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Billing Cycles</h2>
        <p className='text-sm text-muted-foreground'>
          Run manual pulls, inspect attempts, and operate retry/uncollectible outcomes with a Stripe-like cycle ledger.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-4'>
        <div className='rounded-xl border bg-card p-4'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>Open Cycles</p>
          <p className='mt-2 text-2xl font-semibold'>{metrics?.cyclesOpen || 0}</p>
        </div>
        <div className='rounded-xl border bg-card p-4'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>Failed Today</p>
          <p className='mt-2 text-2xl font-semibold text-amber-600'>{metrics?.failedToday || 0}</p>
        </div>
        <div className='rounded-xl border bg-card p-4'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>Paid Today</p>
          <p className='mt-2 text-2xl font-semibold text-emerald-600'>{metrics?.paidToday || 0}</p>
        </div>
        <div className='rounded-xl border bg-card p-4'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>MRR Proxy</p>
          <p className='mt-2 text-2xl font-semibold'>
            {formatMicrosToCurrency(metrics?.mrrProxyMicros || 0n)} cUSDC
          </p>
        </div>
      </div>

      <div className='grid gap-6 xl:grid-cols-[1.1fr_1fr]'>
        <div className='space-y-4'>
          <div className='rounded-xl border bg-card p-6 shadow-sm'>
            <h3 className='font-semibold'>Run Due Charges</h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Preview and manually collect charges where the next charge date has passed. This is UI-first; scheduler comes later.
            </p>

            <div className='mt-4 rounded-lg border bg-background p-4 text-sm'>
              <div className='flex items-center justify-between gap-3'>
                <p className='font-medium'>Due agreements</p>
                <p className='text-xs text-muted-foreground'>{dueAgreements.length}</p>
              </div>
              {dueAgreements.length === 0 ? (
                <p className='mt-2 text-xs text-muted-foreground'>No due charges right now.</p>
              ) : (
                <div className='mt-3 space-y-2'>
                  {dueAgreements.slice(0, 6).map((row) => (
                    <div key={row.subscription.id} className='flex items-center justify-between gap-3 text-xs'>
                      <p className='font-mono'>{row.subscription.customerCardAddress.slice(0, 10)}...</p>
                      <p className='text-muted-foreground'>{formatMicrosToCurrency(row.amountRefMicros)} cUSDC</p>
                      <p className='text-muted-foreground'>{new Date(row.nextChargeAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                  {dueAgreements.length > 6 ? (
                    <p className='text-[11px] text-muted-foreground'>+ {dueAgreements.length - 6} more</p>
                  ) : null}
                </div>
              )}
            </div>

            {dueProgress ? (
              <p className='mt-3 flex items-center gap-2 text-xs text-muted-foreground'>
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
                {dueProgress}
              </p>
            ) : null}

            <div className='mt-4 flex flex-wrap gap-2'>
              <Button
                onClick={handleRunDueCharges}
                disabled={dueLoading || !instance || !me?.account || dueAgreements.length === 0}
                className='gap-2'
              >
                {dueLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <CreditCard className='h-4 w-4' />}
                Run Due Charges
              </Button>
            </div>
          </div>

          <div className='rounded-xl border bg-card p-6 shadow-sm'>
            <h3 className='font-semibold'>Run Manual Billing Attempt</h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Creates/updates subscription cycle records, then submits `pullSubscription` through account abstraction.
            </p>

            <div className='mt-5 space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Load Existing Subscription (Optional)</label>
                <select
                  className='h-10 w-full rounded-md border bg-background px-3 text-sm'
                  value={selectedSubscriptionId}
                  onChange={(event) => handlePickSubscription(event.target.value)}
                >
                  <option value=''>Manual entry</option>
                  {availableSubscriptions.map((subscription) => (
                    <option key={subscription.id} value={subscription.id}>
                      {`${subscription.status.toUpperCase()} • ${subscription.customerCardAddress.slice(0, 8)}...${subscription.customerCardAddress.slice(-4)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Customer Card Address</label>
                <input
                  value={customerCard}
                  onChange={(event) => setCustomerCard(event.target.value.trim())}
                  placeholder='0x...'
                  className='h-10 w-full rounded-md border bg-background px-3 text-sm'
                />
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Amount (cUSDC)</label>
                  <input
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    type='number'
                    placeholder='5.00'
                    min='0'
                    step='0.000001'
                    className='h-10 w-full rounded-md border bg-background px-3 text-sm'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Billing Period (days)</label>
                  <input
                    value={periodDays}
                    onChange={(event) => setPeriodDays(event.target.value)}
                    type='number'
                    min='1'
                    className='h-10 w-full rounded-md border bg-background px-3 text-sm'
                  />
                </div>
              </div>

              <Button onClick={handleCharge} disabled={loading || !instance || !me?.account} className='gap-2'>
                {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <CreditCard className='h-4 w-4' />}
                Submit Billing Attempt
              </Button>
            </div>
          </div>
        </div>

        <div className='rounded-xl border bg-card p-6 shadow-sm'>
          <h3 className='font-semibold'>Cycle Details</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Select a cycle to inspect attempts and operator controls.
          </p>

          <div className='mt-4 space-y-3'>
            <select
              className='h-10 w-full rounded-md border bg-background px-3 text-sm'
              value={selectedCycle?.id || ''}
              onChange={(event) => setSelectedCycleId(event.target.value || null)}
            >
              {sortedCycles.length === 0 ? <option value=''>No cycles yet</option> : null}
              {sortedCycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {`${cycle.status.toUpperCase()} • ${cycle.id.slice(-6)} • ${new Date(cycle.createdAt).toLocaleDateString()}`}
                </option>
              ))}
            </select>

            {selectedCycle ? (
              <div className='rounded-lg border bg-background p-4 text-sm'>
                <div className='flex items-center justify-between gap-3'>
                  <BillingStatusBadge status={selectedCycle.status} />
                  {selectedCycleSubscription ? <SubscriptionStatusBadge status={selectedCycleSubscription.status} /> : null}
                </div>
                <div className='mt-3 space-y-1 text-xs text-muted-foreground'>
                  <p>Attempts: {selectedCycle.attemptCount}</p>
                  <p>
                    Next retry:{' '}
                    {selectedCycle.nextAttemptAt ? new Date(selectedCycle.nextAttemptAt).toLocaleString() : 'Not scheduled'}
                  </p>
                  <p>Period end: {new Date(selectedCycle.cycleEnd).toLocaleString()}</p>
                </div>
                <div className='mt-4 flex flex-wrap gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    className='gap-1'
                    onClick={() => requestCycleRetry(selectedCycle.id)}
                  >
                    <RefreshCcw className='h-3.5 w-3.5' />
                    Retry Now
                  </Button>
                  <Button
                    size='sm'
                    variant='destructive'
                    className='gap-1'
                    onClick={() => setCycleUncollectible(selectedCycle.id)}
                  >
                    <ShieldAlert className='h-3.5 w-3.5' />
                    Mark Uncollectible
                  </Button>
                </div>
              </div>
            ) : (
              <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
                Run your first billing attempt to create a cycle.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='rounded-xl border bg-card shadow-sm'>
        <div className='p-4'>
          <h3 className='font-semibold'>Billing Cycle Ledger</h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='border-y bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 font-medium'>Cycle</th>
                <th className='px-4 py-3 font-medium'>Subscription</th>
                <th className='px-4 py-3 font-medium'>Status</th>
                <th className='px-4 py-3 font-medium'>Attempts</th>
                <th className='px-4 py-3 font-medium'>Failure Class</th>
                <th className='px-4 py-3 font-medium'>Next Retry</th>
              </tr>
            </thead>
            <tbody className='divide-y'>
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
                    className='cursor-pointer hover:bg-muted/40'
                    onClick={() => setSelectedCycleId(cycle.id)}
                  >
                    <td className='px-4 py-3 font-mono text-xs'>{cycle.id}</td>
                    <td className='px-4 py-3 font-mono text-xs'>{cycle.subscriptionId.slice(-10)}</td>
                    <td className='px-4 py-3'>
                      <BillingStatusBadge status={cycle.status} />
                    </td>
                    <td className='px-4 py-3'>{cycle.attemptCount}</td>
                    <td className='px-4 py-3'>
                      {cycle.lastFailureClass ? <FailureClassBadge failureClass={cycle.lastFailureClass} /> : '-'}
                    </td>
                    <td className='px-4 py-3 text-xs'>
                      {cycle.nextAttemptAt ? new Date(cycle.nextAttemptAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCycle && selectedCycleAttempts.length > 0 ? (
        <div className='rounded-xl border bg-card p-4 shadow-sm'>
          <h3 className='font-semibold'>Attempt Timeline</h3>
          <div className='mt-3 space-y-2'>
            {selectedCycleAttempts.map((attempt) => (
              <div key={attempt.id} className='rounded-md border bg-background p-3 text-xs'>
                <div className='flex items-center justify-between gap-3'>
                  <p className='font-medium'>
                    Attempt #{attempt.attemptNumber} • {attempt.status}
                  </p>
                  <p className='text-muted-foreground'>{new Date(attempt.startedAt).toLocaleString()}</p>
                </div>
                <p className='mt-1 text-muted-foreground'>Requested: {formatMicrosToCurrency(attempt.requestedAmountRef)} cUSDC</p>
                {attempt.failureClass ? (
                  <p className='mt-1 text-rose-600'>
                    {attempt.failureClass.replaceAll('_', ' ')} {attempt.failureReason ? `• ${attempt.failureReason}` : ''}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
