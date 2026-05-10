'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMe } from '@/providers/auth-provider';
import { fetchActivitiesFromApi } from '@/lib/merchant/control-plane-store';
import { RefreshCw } from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import {
  IconSearch,
  IconFilter,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconReceipt,
  IconShieldCheck,
  IconCreditCard,
  IconClock,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import type { CustomerActivity, CustomerActivityType } from '@/lib/merchant/types';

const ACTIVITY_ICONS: Record<CustomerActivityType, React.ElementType> = {
  shield: IconShieldCheck,
  unshield: IconShieldCheck,
  send: IconArrowUpRight,
  subscribe: IconCreditCard,
  cancel_subscription: IconX,
  pause_subscription: IconClock,
  resume_subscription: IconClock,
  card_created: IconCreditCard,
  card_linked: IconCreditCard,
  card_unlinked: IconX,
  payment_received: IconArrowDownLeft,
};

const ACTIVITY_LABELS: Record<CustomerActivityType, string> = {
  shield: 'Shielded',
  unshield: 'Unshielded',
  send: 'Sent',
  subscribe: 'Subscribed',
  cancel_subscription: 'Subscription Cancelled',
  pause_subscription: 'Subscription Paused',
  resume_subscription: 'Subscription Resumed',
  card_created: 'Card Created',
  card_linked: 'Card Linked',
  card_unlinked: 'Card Unlinked',
  payment_received: 'Payment Received',
};

const ACTIVITY_COLORS: Record<CustomerActivityType, string> = {
  shield: 'bg-blue-500/10 text-blue-500',
  unshield: 'bg-indigo-500/10 text-indigo-500',
  send: 'bg-primary/10 text-primary',
  subscribe: 'bg-emerald-500/10 text-emerald-500',
  cancel_subscription: 'bg-red-500/10 text-red-500',
  pause_subscription: 'bg-amber-500/10 text-amber-500',
  resume_subscription: 'bg-emerald-500/10 text-emerald-500',
  card_created: 'bg-purple-500/10 text-purple-500',
  card_linked: 'bg-purple-500/10 text-purple-500',
  card_unlinked: 'bg-red-500/10 text-red-500',
  payment_received: 'bg-emerald-500/10 text-emerald-500',
};

export default function ActivityPage() {
  const { me, isLoading: authLoading } = useMe();
  const [activities, setActivities] = useState<CustomerActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<CustomerActivityType | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadActivities = async () => {
    if (me?.account) {
      const data = await fetchActivitiesFromApi(me.account);
      setActivities(data);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [me?.account]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadActivities();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredActivities = useMemo(() => {
    let filtered = activities;

    if (typeFilter !== 'all') {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.type.toLowerCase().includes(q) ||
          a.amount?.toLowerCase().includes(q) ||
          a.merchantAddress?.toLowerCase().includes(q) ||
          a.planName?.toLowerCase().includes(q) ||
          a.counterpartyAddress?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [activities, searchQuery, typeFilter]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, CustomerActivity[]> = {};
    for (const activity of filteredActivities) {
      const date = new Date(activity.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    }
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [filteredActivities]);

  if (authLoading) {
    return (
      <div className='flex-1 space-y-4 p-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 w-32 rounded bg-muted' />
          <div className='h-96 rounded-xl bg-muted' />
        </div>
      </div>
    );
  }

  if (!me?.account) {
    return (
      <div className='flex-1 space-y-4 p-6'>
        <div className='flex flex-col items-center justify-center py-16 text-center'>
          <IconClock className='h-12 w-12 text-muted-foreground/50' />
          <h3 className='mt-4 text-lg font-semibold'>Connect your wallet</h3>
          <p className='mt-2 text-sm text-muted-foreground'>
            Connect your wallet to see your activity history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 space-y-5 p-6'>
      {/* Header */}
      <div className='space-y-3'>
        <h2 className='text-sm font-bold uppercase tracking-[0.22em] text-foreground sm:text-base'>Activity</h2>
        <div className='h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent' />
      </div>

      {/* Toolbar */}
      <div className='flex flex-wrap items-center gap-2'>
        <div className='relative flex-1 min-w-[200px]'>
          <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search transactions...'
            className='h-9 pl-9 rounded-lg'
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as CustomerActivityType | 'all')}
          className='h-9 rounded-md border bg-background px-3 text-sm'
        >
          <option value='all'>All Types</option>
          <option value='shield'>Shield</option>
          <option value='unshield'>Unshield</option>
          <option value='send'>Send</option>
          <option value='subscribe'>Subscribe</option>
          <option value='payment_received'>Payment Received</option>
          <option value='card_created'>Card Created</option>
          <option value='card_linked'>Card Linked</option>
          <option value='card_unlinked'>Card Unlinked</option>
        </select>
        <Button
          variant='outline'
          size='sm'
          onClick={handleRefresh}
          disabled={isRefreshing}
          className='h-9 gap-2'
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Activity list */}
      <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur overflow-hidden'>
        {filteredActivities.length > 0 ? (
          <div className='divide-y divide-border/40'>
            {groupedByDate.map(({ date, items }) => (
              <div key={date}>
                <div className='bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground'>
                  {date}
                </div>
                {items.map((activity) => {
                  const Icon = ACTIVITY_ICONS[activity.type] || IconReceipt;
                  const label = ACTIVITY_LABELS[activity.type] || activity.type;
                  const colorClass = ACTIVITY_COLORS[activity.type] || 'bg-muted/10 text-muted-foreground';
                  const isPending = activity.status === 'pending';
                  const isFailed = activity.status === 'failed';

                  return (
                    <div
                      key={activity.id}
                      className='flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors'
                    >
                      {/* Icon */}
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                        <Icon size={18} />
                      </div>

                      {/* Details */}
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-medium'>{label}</p>
                        <p className='text-xs text-muted-foreground truncate'>
                          {activity.amount && activity.token
                            ? `${activity.amount} ${activity.token}`
                            : ''}
                          {activity.token && !activity.amount && activity.token.includes('...') 
                            ? `Card: ${activity.token}` 
                            : ''}
                          {activity.counterpartyAddress &&
                            ` to ${activity.counterpartyAddress.slice(0, 6)}...${activity.counterpartyAddress.slice(-4)}`}
                          {activity.merchantAddress &&
                            ` to ${activity.merchantAddress.slice(0, 6)}...${activity.merchantAddress.slice(-4)}`}
                          {activity.planName && ` - ${activity.planName}`}
                        </p>
                      </div>

                      {/* Status + Time */}
                      <div className='flex flex-col items-end gap-1 shrink-0'>
                        <Badge
                          variant={
                            isPending
                              ? 'secondary'
                              : isFailed
                                ? 'destructive'
                                : 'default'
                          }
                          className='text-[10px]'
                        >
                          {isPending ? (
                            <IconClock size={10} className='mr-1 animate-spin' />
                          ) : isFailed ? (
                            <IconX size={10} className='mr-1' />
                          ) : (
                            <IconCheck size={10} className='mr-1' />
                          )}
                          {activity.status}
                        </Badge>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(activity.createdAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                        {(activity.txHash || activity.userOpHash) && (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${activity.txHash || activity.userOpHash}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-1 text-xs text-primary hover:underline'
                          >
                            <ExternalLink size={10} />
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4'>
              <IconReceipt size={24} className='text-muted-foreground/50' />
            </div>
            <h3 className='text-sm font-semibold'>
              {searchQuery || typeFilter !== 'all'
                ? 'No matching transactions'
                : 'No transactions yet'}
            </h3>
            <p className='mt-1 text-xs text-muted-foreground max-w-sm'>
              {searchQuery || typeFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Your transaction history will appear here once you shield, send, or subscribe.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
