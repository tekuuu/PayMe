'use client';

import { useMemo, useState } from 'react';
import { useMe } from '@/providers/auth-provider';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';
import { SubscriptionStatusBadge } from '@/components/merchant/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatMicrosToCurrency } from '@/lib/merchant/control-plane-store';
import type { SubscriptionAgreement } from '@/lib/merchant/types';
import { toast } from 'sonner';
import { Copy, Search, ChevronDown, ChevronUp, Wallet, CreditCard, Calendar, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';

const FILTERS = [
  'all',
  'active',
  'past_due',
  'unpaid',
  'paused',
  'incomplete',
  'canceled',
] as const;

function shortAddress(address: string) {
  if (!address) return '-';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function copyText(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied`);
}

function SubscriptionCard({
  subscription,
  plan,
  latestAttempt,
  onPause,
  onResume,
  onCancel,
}: {
  subscription: SubscriptionAgreement;
  plan?: { name: string; amountRefMicros: string };
  latestAttempt?: string;
  onPause: () => void;
  onResume: () => void;
  onCancel: (atPeriodEnd: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isCanceled = subscription.status === 'canceled';
  const isPaused = subscription.status === 'paused';

  return (
    <div className={`rounded-xl border border-border/60 bg-card/50 backdrop-blur overflow-hidden transition-all hover:border-border/80 ${isCanceled ? 'opacity-70' : ''}`}>
      {/* Header */}
      <div className='px-5 py-4'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <SubscriptionStatusBadge status={subscription.status} />
            {subscription.cancelAtPeriodEnd && (
              <span className='inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600'>
                <AlertCircle className='h-3 w-3' />
                Cancels at period end
              </span>
            )}
            <div>
              <h3 className='text-base font-semibold text-foreground'>{plan?.name || 'Default Plan'}</h3>
              <p className='text-xs text-muted-foreground'>
                Started {new Date(subscription.startedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className='text-right'>
            <p className='text-2xl font-bold text-foreground tabular-nums'>
              ${formatMicrosToCurrency(plan?.amountRefMicros || '0')}
            </p>
            <p className='text-xs text-muted-foreground'>per cycle</p>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className='flex items-center gap-2 px-5 py-3 border-t border-border/30 bg-muted/10'>
        <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
          <CreditCard className='h-3.5 w-3.5' />
          <span className='font-mono'>{shortAddress(subscription.customerCardAddress)}</span>
          <button
            onClick={() => copyText(subscription.customerCardAddress, 'Card address')}
            className='p-0.5 text-muted-foreground/60 hover:text-foreground transition-colors'
          >
            <Copy size={12} />
          </button>
        </div>
        <span className='text-muted-foreground/30'>·</span>
        <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
          <Wallet className='h-3.5 w-3.5' />
          <span className='font-mono'>{subscription.customerSmartWallet ? shortAddress(subscription.customerSmartWallet) : 'N/A'}</span>
          {subscription.customerSmartWallet && (
            <button
              onClick={() => copyText(subscription.customerSmartWallet!, 'Wallet address')}
              className='p-0.5 text-muted-foreground/60 hover:text-foreground transition-colors'
            >
              <Copy size={12} />
            </button>
          )}
        </div>
        <span className='text-muted-foreground/30'>·</span>
        <div className='flex items-center gap-1.5 text-xs text-muted-foreground ml-auto'>
          <Calendar className='h-3.5 w-3.5' />
          <span>Next: {new Date(subscription.nextChargeAt || subscription.currentPeriodEnd).toLocaleDateString()}</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className='ml-2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/40'
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className='border-t border-border/40 bg-background/50 px-5 py-4 space-y-4'>
          {/* Period info */}
          <div className='grid grid-cols-3 gap-px rounded-lg border border-border/30 bg-border/30 overflow-hidden'>
            <div className='bg-card/60 p-3'>
              <p className='text-[10px] uppercase tracking-wider text-muted-foreground'>Period Start</p>
              <p className='mt-1 text-sm font-medium tabular-nums'>
                {new Date(subscription.currentPeriodStart).toLocaleDateString()}
              </p>
            </div>
            <div className='bg-card/60 p-3'>
              <p className='text-[10px] uppercase tracking-wider text-muted-foreground'>Period End</p>
              <p className='mt-1 text-sm font-medium tabular-nums'>
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
            <div className='bg-card/60 p-3'>
              <p className='text-[10px] uppercase tracking-wider text-muted-foreground'>Last Charge</p>
              <p className='mt-1 text-sm font-medium tabular-nums'>
                {subscription.lastChargeAt ? new Date(subscription.lastChargeAt).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>

          {/* Latest attempt */}
          {latestAttempt && (
            <div className='flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/30'>
              <DollarSign className='h-4 w-4 text-muted-foreground shrink-0' />
              <div>
                <p className='text-[10px] uppercase tracking-wider text-muted-foreground'>Latest Attempt</p>
                <p className='text-xs font-mono mt-0.5'>{latestAttempt}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className='flex items-center gap-2 pt-2 border-t border-border/30'>
            {isPaused ? (
              <Button size='sm' variant='outline' onClick={onResume}>
                Resume
              </Button>
            ) : (
              <Button size='sm' variant='outline' onClick={onPause} disabled={isCanceled}>
                Pause
              </Button>
            )}
            <Button size='sm' variant='secondary' onClick={() => onCancel(true)} disabled={isCanceled}>
              Cancel End-Period
            </Button>
            <Button size='sm' variant='destructive' onClick={() => onCancel(false)} disabled={isCanceled}>
              Cancel Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MerchantSubscriptionsPage() {
  const { me } = useMe();
  const {
    state,
    isHydrated,
    refresh,
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

  const stats = useMemo(() => {
    const subs = state?.subscriptions || [];
    return {
      total: subs.length,
      active: subs.filter((s) => s.status === 'active').length,
      pastDue: subs.filter((s) => s.status === 'past_due').length,
      unpaid: subs.filter((s) => s.status === 'unpaid').length,
      paused: subs.filter((s) => s.status === 'paused').length,
      canceled: subs.filter((s) => s.status === 'canceled').length,
    };
  }, [state?.subscriptions]);

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
    <div className='flex-1 space-y-4 p-6'>
      <div className='space-y-1'>
        <h2 className='text-2xl font-semibold tracking-tight text-foreground'>Subscribers</h2>
      </div>
      <div className='flex items-center gap-2'>
        <Button variant='outline' size='sm' className='gap-2' onClick={() => refresh()}>
          <RefreshCw className='h-4 w-4' />
          Refresh
        </Button>
      </div>
      <div className='h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent' />

      {/* Stats */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'>
        <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-4'>
          <p className='text-[10px] uppercase tracking-wider text-muted-foreground'>Total</p>
          <p className='mt-1 text-2xl font-bold tabular-nums'>{stats.total}</p>
        </div>
        <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-4'>
          <p className='text-[10px] uppercase tracking-wider text-muted-foreground'>Active</p>
          <p className='mt-1 text-2xl font-bold tabular-nums text-emerald-600'>{stats.active}</p>
        </div>
        <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-4'>
          <p className='text-[10px] uppercase tracking-wider text-muted-foreground'>Past Due</p>
          <p className='mt-1 text-2xl font-bold tabular-nums text-amber-600'>{stats.pastDue}</p>
        </div>
        <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-4'>
          <p className='text-[10px] uppercase tracking-wider text-muted-foreground'>Unpaid</p>
          <p className='mt-1 text-2xl font-bold tabular-nums text-rose-600'>{stats.unpaid}</p>
        </div>
        <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-4'>
          <p className='text-[10px] uppercase tracking-wider text-muted-foreground'>Paused</p>
          <p className='mt-1 text-2xl font-bold tabular-nums text-violet-600'>{stats.paused}</p>
        </div>
        <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-4'>
          <p className='text-[10px] uppercase tracking-wider text-muted-foreground'>Canceled</p>
          <p className='mt-1 text-2xl font-bold tabular-nums text-zinc-500'>{stats.canceled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className='grid gap-4 md:grid-cols-[1fr_200px]'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Search by customer card, wallet, or plan...'
            className='pl-9'
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as (typeof FILTERS)[number])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((filter) => (
              <SelectItem key={filter} value={filter}>
                {filter === 'all' ? 'All statuses' : filter.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subscription cards */}
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {!isHydrated ? (
          <div className='col-span-full rounded-xl border border-border/60 bg-card/50 backdrop-blur p-8 text-center text-muted-foreground'>
            Loading subscription ledger...
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className='col-span-full rounded-xl border border-border/60 bg-card/50 backdrop-blur p-8 text-center text-muted-foreground'>
            No subscriptions match this filter.
          </div>
        ) : (
          filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              plan={plansById.get(subscription.planId)}
              latestAttempt={latestAttemptBySubscription.get(subscription.id)}
              onPause={() => {
                setSubscriptionPaused(subscription.id);
                toast.success('Subscription paused');
              }}
              onResume={() => {
                setSubscriptionResumed(subscription.id);
                toast.success('Subscription resumed');
              }}
              onCancel={(atPeriodEnd) => {
                setSubscriptionCanceled(subscription.id, atPeriodEnd);
                toast.success(atPeriodEnd ? 'Cancellation scheduled for period end' : 'Subscription canceled now');
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
