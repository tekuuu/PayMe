'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useMe } from '@/providers/auth-provider';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';
import { FailureClassBadge, SubscriptionStatusBadge } from '@/components/merchant/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <div className='flex-1 space-y-4 p-6'>
      <div className='max-w-3xl space-y-1'>
        <h2 className='text-2xl font-semibold tracking-tight text-foreground'>Recovery</h2>
        <p className='text-sm text-muted-foreground'>
          Stripe-style dunning and retry operations for failed subscription collection.
        </p>
      </div>
      <div className='max-w-3xl h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent' />

      <div className='max-w-3xl grid gap-6 xl:grid-cols-[1fr_1.5fr]'>
        <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-6'>
          <h3 className='font-semibold'>Retry Policy</h3>
          <p className='mt-1 text-sm text-muted-foreground'>Controls automatic scheduling and terminal behavior after failure exhaustion.</p>

          <div className='mt-4 space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Max Attempts</label>
              <Input
                type='number'
                min='1'
                max='20'
                value={maxAttempts}
                onChange={(event) => setMaxAttempts(event.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Retry Windows (minutes, comma-separated)</label>
              <Input
                value={windowsInput}
                onChange={(event) => setWindowsInput(event.target.value)}
                placeholder='10,60,360,1440,4320'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Terminal Status on Exhausted</label>
              <Select value={terminalStatus} onValueChange={(value) => setTerminalStatus(value as TerminalFailureStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='unpaid'>unpaid</SelectItem>
                  <SelectItem value='canceled'>canceled</SelectItem>
                  <SelectItem value='past_due'>past_due</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSavePolicy}>Save Policy</Button>
          </div>
        </div>

        <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-6'>
          <h3 className='font-semibold'>Recovery Queue</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Prioritized cycles grouped by failure type for faster triage.
          </p>

          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <div className='rounded-lg border border-border/40 bg-background/50 p-4'>
              <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>Needs Customer Action</p>
              <p className='mt-2 text-2xl font-semibold tabular-nums text-amber-600'>{segmentedQueue.requires_customer_action.length}</p>
            </div>
            <div className='rounded-lg border border-border/40 bg-background/50 p-4'>
              <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>Recoverable Transient</p>
              <p className='mt-2 text-2xl font-semibold tabular-nums text-sky-600'>{segmentedQueue.recoverable_transient.length}</p>
            </div>
            <div className='rounded-lg border border-border/40 bg-background/50 p-4'>
              <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>Hard Failure</p>
              <p className='mt-2 text-2xl font-semibold tabular-nums text-rose-600'>{segmentedQueue.hard_failure.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-3xl rounded-xl border border-border/60 bg-card/50 backdrop-blur overflow-hidden'>
        <div className='p-4 border-b border-border/40'>
          <h3 className='font-semibold'>Queue Items</h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='border-b border-border/40 bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 font-medium'>Customer</th>
                <th className='px-4 py-3 font-medium'>Subscription Status</th>
                <th className='px-4 py-3 font-medium'>Failure Class</th>
                <th className='px-4 py-3 font-medium'>Attempts</th>
                <th className='px-4 py-3 font-medium'>Next Retry</th>
                <th className='px-4 py-3 font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/30'>
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
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => {
                            requestCycleRetry(item.cycle.id);
                            toast.success('Retry requested');
                          }}
                        >
                          Retry Now
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => {
                            setCycleUncollectible(item.cycle.id);
                            toast.success('Cycle marked uncollectible');
                          }}
                        >
                          Mark Uncollectible
                        </Button>
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
