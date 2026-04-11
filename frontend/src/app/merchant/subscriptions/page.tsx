'use client';

import { useMemo, useState } from 'react';
import { useMe } from '@/providers/auth-provider';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';
import { SubscriptionStatusBadge } from '@/components/merchant/status-badge';
import { Button } from '@/components/ui/button';
import { formatMicrosToCurrency } from '@/lib/merchant/control-plane-store';
import { toast } from 'sonner';

function shortAddress(address: string) {
  if (!address) return '-';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const FILTERS = [
  'all',
  'active',
  'past_due',
  'unpaid',
  'paused',
  'incomplete',
  'canceled',
] as const;

export default function MerchantSubscriptionsPage() {
  const { me } = useMe();
  const {
    state,
    isHydrated,
    setSubscriptionPaused,
    setSubscriptionResumed,
    setSubscriptionCanceled,
  } = useMerchantControlPlane(me?.account);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof FILTERS)[number]>('all');

  const plansById = useMemo(() => {
    const map = new Map<string, { name: string; amountRefMicros: string }>();
    for (const plan of state?.plans || []) {
      map.set(plan.id, { name: plan.name, amountRefMicros: plan.amountRefMicros || '0' });
    }
    return map;
  }, [state?.plans]);

  const latestAttemptBySubscription = useMemo(() => {
    const map = new Map<string, string>();
    for (const attempt of state?.attempts || []) {
      if (map.has(attempt.subscriptionId)) continue;
      map.set(attempt.subscriptionId, `${attempt.status} • #${attempt.attemptNumber}`);
    }
    return map;
  }, [state?.attempts]);

  const filteredSubscriptions = useMemo(() => {
    const source = state?.subscriptions || [];
    const normalizedQuery = query.trim().toLowerCase();

    return source.filter((subscription) => {
      if (statusFilter !== 'all' && subscription.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) return true;
      return (
        subscription.customerCardAddress.toLowerCase().includes(normalizedQuery) ||
        (subscription.customerSmartWallet || '').toLowerCase().includes(normalizedQuery) ||
        (plansById.get(subscription.planId)?.name || '').toLowerCase().includes(normalizedQuery)
      );
    });
  }, [state?.subscriptions, query, statusFilter, plansById]);

  return (
    <div className='flex-1 space-y-6 p-8 pt-6'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Subscribers</h2>
        <p className='text-sm text-muted-foreground'>
          Customer agreements grouped by plan, with Stripe-style statuses and operator actions.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-[1fr_220px]'>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder='Search by customer card, wallet, or plan...'
          className='h-10 rounded-md border bg-background px-3 text-sm'
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as (typeof FILTERS)[number])}
          className='h-10 rounded-md border bg-background px-3 text-sm'
        >
          {FILTERS.map((filter) => (
            <option key={filter} value={filter}>
              {filter === 'all' ? 'All statuses' : filter.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className='rounded-xl border bg-card shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 font-medium'>Customer Card</th>
                <th className='px-4 py-3 font-medium'>Plan</th>
                <th className='px-4 py-3 font-medium'>Amount</th>
                <th className='px-4 py-3 font-medium'>Status</th>
                <th className='px-4 py-3 font-medium'>Next Charge</th>
                <th className='px-4 py-3 font-medium'>Latest Attempt</th>
                <th className='px-4 py-3 font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {!isHydrated ? (
                <tr>
                  <td className='px-4 py-8 text-center text-muted-foreground' colSpan={7}>
                    Loading subscription ledger...
                  </td>
                </tr>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td className='px-4 py-8 text-center text-muted-foreground' colSpan={7}>
                    No subscriptions match this filter yet.
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className='align-top'>
                    <td className='px-4 py-3'>
                      <div className='font-mono text-xs'>{shortAddress(subscription.customerCardAddress)}</div>
                      <div className='mt-1 text-[11px] text-muted-foreground'>
                        {subscription.customerSmartWallet
                          ? `Wallet ${shortAddress(subscription.customerSmartWallet)}`
                          : 'Wallet unknown'}
                      </div>
                    </td>
                    <td className='px-4 py-3'>{plansById.get(subscription.planId)?.name || 'Default Monthly'}</td>
                    <td className='px-4 py-3 text-xs text-muted-foreground'>
                      {formatMicrosToCurrency(plansById.get(subscription.planId)?.amountRefMicros || '0')} cUSDC
                    </td>
                    <td className='px-4 py-3'>
                      <SubscriptionStatusBadge status={subscription.status} />
                    </td>
                    <td className='px-4 py-3 text-xs'>
                      {new Date(subscription.nextChargeAt || subscription.currentPeriodEnd).toLocaleString()}
                    </td>
                    <td className='px-4 py-3 text-xs text-muted-foreground'>
                      {latestAttemptBySubscription.get(subscription.id) || 'No attempts yet'}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex flex-wrap gap-2'>
                        {subscription.status === 'paused' ? (
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => {
                              setSubscriptionResumed(subscription.id);
                              toast.success('Subscription resumed');
                            }}
                          >
                            Resume
                          </Button>
                        ) : (
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => {
                              setSubscriptionPaused(subscription.id);
                              toast.success('Subscription paused');
                            }}
                            disabled={subscription.status === 'canceled'}
                          >
                            Pause
                          </Button>
                        )}
                        <Button
                          size='sm'
                          variant='secondary'
                          disabled={subscription.status === 'canceled'}
                          onClick={() => {
                            setSubscriptionCanceled(subscription.id, true);
                            toast.success('Cancellation scheduled for period end');
                          }}
                        >
                          Cancel End-Period
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          disabled={subscription.status === 'canceled'}
                          onClick={() => {
                            setSubscriptionCanceled(subscription.id, false);
                            toast.success('Subscription canceled now');
                          }}
                        >
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
      </div>
    </div>
  );
}
