'use client';

import { useMemo, useState } from 'react';
import { Download, Search, RefreshCw } from 'lucide-react';
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
  const { state, refresh } = useMerchantControlPlane(me?.account);
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

  const stats = useMemo(() => {
    return {
      total: customerRows.length,
      active: customerRows.reduce((sum, row) => sum + row.active, 0),
      atRisk: customerRows.reduce((sum, row) => sum + row.pastDue, 0),
    };
  }, [customerRows]);

  return (
    <div className='flex-1 space-y-6 p-6'>
      <div className='space-y-1'>
        <h2 className='text-sm font-bold uppercase tracking-[0.22em] text-foreground sm:text-base'>Customers</h2>
      </div>
      <div className='h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent' />

      <div className='flex items-center gap-2'>
        <Button variant='outline' className='gap-2' onClick={() => refresh()}>
          <RefreshCw className='h-4 w-4' />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4'>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Total Customers</p>
            <p className='text-3xl font-bold text-foreground tabular-nums'>{stats.total}</p>
          </div>
        </div>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Active Agreements</p>
            <p className='text-3xl font-bold text-foreground tabular-nums'>{stats.active}</p>
          </div>
        </div>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
            <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>At Risk</p>
            <p className='text-3xl font-bold text-foreground tabular-nums'>{stats.atRisk}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur overflow-hidden'>
        <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
        <div className='relative border-b border-border/40 p-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search by customer card or wallet...'
              className='pl-9 rounded-xl'
            />
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='border-b border-border/40 bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground'>
              <tr>
                <th className='px-4 py-4 font-semibold'>Customer Card</th>
                <th className='px-4 py-4 font-semibold'>Wallet</th>
                <th className='px-4 py-4 font-semibold'>Agreements</th>
                <th className='px-4 py-4 font-semibold'>Status</th>
                <th className='px-4 py-4 font-semibold'>Last Activity</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/30'>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-4 py-8 text-center text-muted-foreground'>
                    No customer records yet. Run checkout approvals or billing pulls to populate this table.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.customerCardAddress} className='hover:bg-muted/40 transition-colors'>
                    <td className='px-4 py-4 font-mono text-xs text-muted-foreground'>{shortAddress(row.customerCardAddress)}</td>
                    <td className='px-4 py-4 font-mono text-xs text-muted-foreground'>{shortAddress(row.customerSmartWallet || '-')}</td>
                    <td className='px-4 py-4'>
                      <div className='text-xs font-semibold text-foreground'>
                        {row.agreements} total <span className='text-muted-foreground'>·</span> {row.active} active <span className='text-muted-foreground'>·</span> {row.pastDue} at risk
                      </div>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex flex-wrap gap-2'>
                        {[...row.statuses].slice(0, 3).map((status) => (
                          <SubscriptionStatusBadge key={status} status={status} />
                        ))}
                      </div>
                    </td>
                    <td className='px-4 py-4 text-xs text-muted-foreground'>
                      {row.latestActivity ? new Date(row.latestActivity).toLocaleString() : '—'}
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
