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
    <div className='flex-1 space-y-6 p-6'>
      <div className='space-y-1'>
        <h2 className='text-2xl font-semibold tracking-tight text-foreground'>Recovery</h2>
        <p className='text-sm text-muted-foreground'>
          Manage retry policies and monitor failed payment recovery with automated strategies.
        </p>
      </div>
      <div className='h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent' />

      <div className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Needs Customer Action</p>
            <p className='text-3xl font-bold text-foreground tabular-nums'>{segmentedQueue.requires_customer_action.length}</p>
          </div>
        </div>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Recoverable Transient</p>
            <p className='text-3xl font-bold text-foreground tabular-nums'>{segmentedQueue.recoverable_transient.length}</p>
          </div>
        </div>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Hard Failure</p>
            <p className='text-3xl font-bold text-foreground tabular-nums'>{segmentedQueue.hard_failure.length}</p>
          </div>
        </div>
      </div>

      <div className='grid gap-6 xl:grid-cols-[1fr_1.5fr]'>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 space-y-4'>
            <div>
              <h3 className='text-base font-semibold text-foreground'>Retry Policy</h3>
              <p className='mt-1 text-xs text-muted-foreground'>Controls automatic scheduling and terminal behavior after exhaustion.</p>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Max Attempts</label>
                <Input
                  type='number'
                  min='1'
                  max='20'
                  value={maxAttempts}
                  onChange={(event) => setMaxAttempts(event.target.value)}
                  className='rounded-xl'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Retry Windows (minutes)</label>
                <Input
                  value={windowsInput}
                  onChange={(event) => setWindowsInput(event.target.value)}
                  placeholder='10,60,360,1440,4320'
                  className='rounded-xl'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Terminal Status on Exhausted</label>
                <Select value={terminalStatus} onValueChange={(value) => setTerminalStatus(value as TerminalFailureStatus)}>
                  <SelectTrigger className='rounded-xl'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='unpaid'>unpaid</SelectItem>
                    <SelectItem value='canceled'>canceled</SelectItem>
                    <SelectItem value='past_due'>past_due</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSavePolicy} className='w-full'>Save Policy</Button>
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 space-y-4'>
            <div>
              <h3 className='text-base font-semibold text-foreground'>Recovery Queue Summary</h3>
              <p className='mt-1 text-xs text-muted-foreground'>
                Cycles grouped by failure type for prioritized triage.
              </p>
            </div>

            <div className='space-y-2'>
              <div className='rounded-xl border border-border/40 bg-background/50 p-3 flex items-center justify-between'>
                <p className='text-xs text-muted-foreground'>Needs Customer Action</p>
                <span className='text-sm font-semibold text-foreground'>{segmentedQueue.requires_customer_action.length}</span>
              </div>
              <div className='rounded-xl border border-border/40 bg-background/50 p-3 flex items-center justify-between'>
                <p className='text-xs text-muted-foreground'>Recoverable Transient</p>
                <span className='text-sm font-semibold text-foreground'>{segmentedQueue.recoverable_transient.length}</span>
              </div>
              <div className='rounded-xl border border-border/40 bg-background/50 p-3 flex items-center justify-between'>
                <p className='text-xs text-muted-foreground'>Hard Failure</p>
                <span className='text-sm font-semibold text-foreground'>{segmentedQueue.hard_failure.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur overflow-hidden'>
        <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
        <div className='p-6 border-b border-border/40'>
          <h3 className='text-base font-semibold text-foreground'>Recovery Queue</h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='border-b border-border/40 bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 font-semibold'>Customer</th>
                <th className='px-4 py-3 font-semibold'>Subscription Status</th>
                <th className='px-4 py-3 font-semibold'>Failure Class</th>
                <th className='px-4 py-3 font-semibold'>Attempts</th>
                <th className='px-4 py-3 font-semibold'>Next Retry</th>
                <th className='px-4 py-3 font-semibold'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/30'>
              {recoveryQueue.length === 0 ? (
                <tr>
                  <td className='px-4 py-8 text-center text-muted-foreground' colSpan={6}>
                    No recovery items at this time.
                  </td>
                </tr>
              ) : (
                recoveryQueue.map((item) => (
                  <tr key={item.cycle.id} className='hover:bg-muted/40 transition-colors'>
                    <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>{shortAddress(item.subscription?.customerCardAddress || '-')}</td>
                    <td className='px-4 py-3'>
                      {item.subscription ? <SubscriptionStatusBadge status={item.subscription.status} /> : '-'}
                    </td>
                    <td className='px-4 py-3'>
                      {item.cycle.lastFailureClass ? <FailureClassBadge failureClass={item.cycle.lastFailureClass} /> : '-'}
                    </td>
                    <td className='px-4 py-3 text-sm font-semibold'>{item.cycle.attemptCount}</td>
                    <td className='px-4 py-3 text-xs text-muted-foreground'>
                      {item.cycle.nextAttemptAt ? new Date(item.cycle.nextAttemptAt).toLocaleString() : '—'}
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
                          Retry
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => {
                            setCycleUncollectible(item.cycle.id);
                            toast.success('Cycle marked uncollectible');
                          }}
                        >
                          Uncollectible
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
