'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useMe } from '@/providers/auth-provider';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';
import { FailureClassBadge, SubscriptionStatusBadge } from '@/components/merchant/status-badge';
import type { TerminalFailureStatus } from '@/lib/merchant/types';

function shortAddress(address: string) {
  if (!address) return '-';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function MerchantRecoveryPage() {
  const { me } = useMe();
  const {
    state,
    recoveryQueue,
    requestCycleRetry,
    setCycleUncollectible,
    updateRecoveryPolicy,
  } = useMerchantControlPlane(me?.account);

  const [maxAttempts, setMaxAttempts] = useState('5');
  const [windowsInput, setWindowsInput] = useState('10,60,360,1440,4320');
  const [terminalStatus, setTerminalStatus] = useState<TerminalFailureStatus>('unpaid');

  useEffect(() => {
    if (!state) return;
    setMaxAttempts(String(state.recoveryPolicy.maxAttempts));
    setWindowsInput(state.recoveryPolicy.retryWindowsMinutes.join(','));
    setTerminalStatus(state.recoveryPolicy.terminalStatusOnExhausted);
  }, [state]);

  const segmentedQueue = useMemo(() => {
    return {
      requires_customer_action: recoveryQueue.filter((item) => item.cycle.lastFailureClass === 'requires_customer_action'),
      recoverable_transient: recoveryQueue.filter((item) => item.cycle.lastFailureClass === 'recoverable_transient'),
      hard_failure: recoveryQueue.filter((item) => item.cycle.lastFailureClass === 'hard_failure'),
    };
  }, [recoveryQueue]);

  const handleSavePolicy = () => {
    const windows = windowsInput
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value > 0);
    updateRecoveryPolicy({
      maxAttempts: Number(maxAttempts),
      retryWindowsMinutes: windows,
      terminalStatusOnExhausted: terminalStatus,
    });
    toast.success('Recovery policy updated');
  };

  return (
    <div className='flex-1 space-y-6 p-8 pt-6'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Recovery</h2>
        <p className='text-sm text-muted-foreground'>
          Stripe-style dunning and retry operations for failed subscription collection.
        </p>
      </div>

      <div className='grid gap-6 xl:grid-cols-[1fr_1.5fr]'>
        <div className='rounded-xl border bg-card p-6 shadow-sm'>
          <h3 className='font-semibold'>Retry Policy</h3>
          <p className='mt-1 text-sm text-muted-foreground'>Controls automatic scheduling and terminal behavior after failure exhaustion.</p>

          <div className='mt-4 space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Max Attempts</label>
              <input
                type='number'
                min='1'
                max='20'
                value={maxAttempts}
                onChange={(event) => setMaxAttempts(event.target.value)}
                className='h-10 w-full rounded-md border bg-background px-3 text-sm'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Retry Windows (minutes, comma-separated)</label>
              <input
                value={windowsInput}
                onChange={(event) => setWindowsInput(event.target.value)}
                className='h-10 w-full rounded-md border bg-background px-3 text-sm'
                placeholder='10,60,360,1440,4320'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Terminal Status on Exhausted</label>
              <select
                value={terminalStatus}
                onChange={(event) => setTerminalStatus(event.target.value as TerminalFailureStatus)}
                className='h-10 w-full rounded-md border bg-background px-3 text-sm'
              >
                <option value='unpaid'>unpaid</option>
                <option value='canceled'>canceled</option>
                <option value='past_due'>past_due</option>
              </select>
            </div>
            <button
              onClick={handleSavePolicy}
              className='inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90'
            >
              Save Policy
            </button>
          </div>
        </div>

        <div className='rounded-xl border bg-card p-6 shadow-sm'>
          <h3 className='font-semibold'>Recovery Queue</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Prioritized cycles grouped by failure type for faster triage.
          </p>

          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <div className='rounded-lg border bg-background p-3'>
              <p className='text-xs uppercase tracking-wide text-muted-foreground'>Needs Customer Action</p>
              <p className='mt-2 text-2xl font-semibold text-amber-600'>{segmentedQueue.requires_customer_action.length}</p>
            </div>
            <div className='rounded-lg border bg-background p-3'>
              <p className='text-xs uppercase tracking-wide text-muted-foreground'>Recoverable Transient</p>
              <p className='mt-2 text-2xl font-semibold text-sky-600'>{segmentedQueue.recoverable_transient.length}</p>
            </div>
            <div className='rounded-lg border bg-background p-3'>
              <p className='text-xs uppercase tracking-wide text-muted-foreground'>Hard Failure</p>
              <p className='mt-2 text-2xl font-semibold text-rose-600'>{segmentedQueue.hard_failure.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className='rounded-xl border bg-card shadow-sm'>
        <div className='p-4'>
          <h3 className='font-semibold'>Queue Items</h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='border-y bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 font-medium'>Customer</th>
                <th className='px-4 py-3 font-medium'>Subscription Status</th>
                <th className='px-4 py-3 font-medium'>Failure Class</th>
                <th className='px-4 py-3 font-medium'>Attempts</th>
                <th className='px-4 py-3 font-medium'>Next Retry</th>
                <th className='px-4 py-3 font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {recoveryQueue.length === 0 ? (
                <tr>
                  <td className='px-4 py-8 text-center text-muted-foreground' colSpan={6}>
                    No recovery items right now.
                  </td>
                </tr>
              ) : (
                recoveryQueue.map((item) => (
                  <tr key={item.cycle.id}>
                    <td className='px-4 py-3 font-mono text-xs'>{shortAddress(item.subscription?.customerCardAddress || '-')}</td>
                    <td className='px-4 py-3'>
                      {item.subscription ? <SubscriptionStatusBadge status={item.subscription.status} /> : '-'}
                    </td>
                    <td className='px-4 py-3'>
                      {item.cycle.lastFailureClass ? <FailureClassBadge failureClass={item.cycle.lastFailureClass} /> : '-'}
                    </td>
                    <td className='px-4 py-3'>{item.cycle.attemptCount}</td>
                    <td className='px-4 py-3 text-xs'>
                      {item.cycle.nextAttemptAt ? new Date(item.cycle.nextAttemptAt).toLocaleString() : 'Not scheduled'}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => {
                            requestCycleRetry(item.cycle.id);
                            toast.success('Retry requested');
                          }}
                          className='inline-flex h-8 items-center rounded-md border bg-background px-3 text-xs font-medium hover:bg-muted'
                        >
                          Retry Now
                        </button>
                        <button
                          onClick={() => {
                            setCycleUncollectible(item.cycle.id);
                            toast.success('Cycle marked uncollectible');
                          }}
                          className='inline-flex h-8 items-center rounded-md bg-destructive px-3 text-xs font-medium text-destructive-foreground hover:opacity-90'
                        >
                          Mark Uncollectible
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
