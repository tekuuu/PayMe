'use client';

import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useMe } from '@/providers/auth-provider';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';
import { SubscriptionStatusBadge } from '@/components/merchant/status-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { SubscriptionStatus } from '@/lib/merchant/types';

function shortAddress(address: string) {
  if (!address) return '-';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function CustomersPage() {
  const { me } = useMe();
  const { state } = useMerchantControlPlane(me?.account);
  const [query, setQuery] = useState('');

  const customerRows = useMemo(() => {
    const byCard = new Map<
      string,
      {
        customerCardAddress: string;
        customerSmartWallet?: string;
        agreements: number;
        active: number;
        pastDue: number;
        latestActivity?: string;
        statuses: Set<SubscriptionStatus>;
      }
    >();

    for (const subscription of state?.subscriptions || []) {
      const key = subscription.customerCardAddress.toLowerCase();
      const row = byCard.get(key) || {
        customerCardAddress: subscription.customerCardAddress,
        customerSmartWallet: subscription.customerSmartWallet,
        agreements: 0,
        active: 0,
        pastDue: 0,
        latestActivity: undefined,
        statuses: new Set<SubscriptionStatus>(),
      };
      row.agreements += 1;
      if (subscription.status === 'active') row.active += 1;
      if (subscription.status === 'past_due' || subscription.status === 'unpaid') row.pastDue += 1;
      row.statuses.add(subscription.status);
      if (!row.latestActivity || row.latestActivity < subscription.updatedAt) {
        row.latestActivity = subscription.updatedAt;
      }
      byCard.set(key, row);
    }

    return [...byCard.values()].sort((left, right) => (right.latestActivity || '').localeCompare(left.latestActivity || ''));
  }, [state?.subscriptions]);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return customerRows;
    return customerRows.filter((row) => {
      return (
        row.customerCardAddress.toLowerCase().includes(normalized) ||
        (row.customerSmartWallet || '').toLowerCase().includes(normalized)
      );
    });
  }, [customerRows, query]);

  return (
    <div className='flex-1 space-y-4 p-6'>
      <div className='max-w-3xl flex items-center justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-semibold tracking-tight text-foreground'>Customers</h2>
          <p className='mt-1 text-sm text-muted-foreground'>Subscriber account lens with risk and lifecycle context.</p>
        </div>
        <Button disabled variant='outline' className='gap-2'>
          <Download className='h-4 w-4' />
          Export CSV
        </Button>
      </div>
      <div className='max-w-3xl h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent' />

      <div className='max-w-3xl grid gap-3 md:grid-cols-3'>
        <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-5'>
          <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>Customers</p>
          <p className='mt-2 text-2xl font-semibold tabular-nums'>{customerRows.length}</p>
        </div>
        <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-5'>
          <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>Active Agreements</p>
          <p className='mt-2 text-2xl font-semibold tabular-nums text-emerald-600'>
            {(state?.subscriptions || []).filter((item) => item.status === 'active').length}
          </p>
        </div>
        <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-5'>
          <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>At Risk (Past Due/Unpaid)</p>
          <p className='mt-2 text-2xl font-semibold tabular-nums text-amber-600'>
            {(state?.subscriptions || []).filter((item) => item.status === 'past_due' || item.status === 'unpaid').length}
          </p>
        </div>
      </div>

      <div className='max-w-3xl rounded-xl border border-border/60 bg-card/50 backdrop-blur overflow-hidden'>
        <div className='border-b border-border/40 p-4'>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Search by customer card or wallet...'
          />
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='border-b border-border/40 bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 font-medium'>Customer Card</th>
                <th className='px-4 py-3 font-medium'>Wallet</th>
                <th className='px-4 py-3 font-medium'>Agreements</th>
                <th className='px-4 py-3 font-medium'>Health</th>
                <th className='px-4 py-3 font-medium'>Last Activity</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/30'>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-4 py-12 text-center text-muted-foreground'>
                    No customer records yet. Run checkout approvals or billing pulls to populate this table.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.customerCardAddress}>
                    <td className='px-4 py-3 font-mono text-xs'>{shortAddress(row.customerCardAddress)}</td>
                    <td className='px-4 py-3 font-mono text-xs'>{shortAddress(row.customerSmartWallet || '-')}</td>
                    <td className='px-4 py-3'>
                      <div className='text-xs tabular-nums text-muted-foreground'>
                        {row.agreements} total &middot; {row.active} active &middot; {row.pastDue} risk
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex flex-wrap gap-2'>
                        {[...row.statuses].slice(0, 3).map((status) => (
                          <SubscriptionStatusBadge key={status} status={status} />
                        ))}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-xs text-muted-foreground'>
                      {row.latestActivity ? new Date(row.latestActivity).toLocaleString() : '-'}
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
