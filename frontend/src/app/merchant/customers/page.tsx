'use client';

import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useMe } from '@/providers/auth-provider';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';
import { SubscriptionStatusBadge } from '@/components/merchant/status-badge';
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
    <div className='flex-1 space-y-6 p-8 pt-6'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Customers</h2>
          <p className='mt-1 text-sm text-muted-foreground'>Subscriber account lens with risk and lifecycle context.</p>
        </div>
        <button
          disabled
          className='inline-flex h-10 items-center rounded-md border bg-background px-4 text-sm font-medium opacity-60'
        >
          <Download className='mr-2 h-4 w-4' />
          Export CSV
        </button>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-xl border bg-card p-4'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>Customers</p>
          <p className='mt-2 text-2xl font-semibold'>{customerRows.length}</p>
        </div>
        <div className='rounded-xl border bg-card p-4'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>Active Agreements</p>
          <p className='mt-2 text-2xl font-semibold text-emerald-600'>
            {(state?.subscriptions || []).filter((item) => item.status === 'active').length}
          </p>
        </div>
        <div className='rounded-xl border bg-card p-4'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>At Risk (Past Due/Unpaid)</p>
          <p className='mt-2 text-2xl font-semibold text-amber-600'>
            {(state?.subscriptions || []).filter((item) => item.status === 'past_due' || item.status === 'unpaid').length}
          </p>
        </div>
      </div>

      <div className='rounded-xl border bg-card shadow-sm'>
        <div className='border-b p-4'>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Search by customer card or wallet...'
            className='h-10 w-full rounded-md border bg-background px-3 text-sm'
          />
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 font-medium'>Customer Card</th>
                <th className='px-4 py-3 font-medium'>Wallet</th>
                <th className='px-4 py-3 font-medium'>Agreements</th>
                <th className='px-4 py-3 font-medium'>Health</th>
                <th className='px-4 py-3 font-medium'>Last Activity</th>
              </tr>
            </thead>
            <tbody className='divide-y'>
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
                      <div className='text-xs text-muted-foreground'>
                        {row.agreements} total • {row.active} active • {row.pastDue} risk
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
