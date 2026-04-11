'use client';

import { Badge } from '@/components/ui/badge';
import type { BillingCycleStatus, FailureClass, SubscriptionStatus } from '@/lib/merchant/types';
import { cn } from '@/lib/utils';

const subscriptionStatusStyles: Record<SubscriptionStatus, string> = {
  trialing: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
  incomplete: 'bg-slate-500/15 text-slate-700 border-slate-500/30',
  active: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  past_due: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  unpaid: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
  paused: 'bg-violet-500/15 text-violet-700 border-violet-500/30',
  canceled: 'bg-zinc-500/15 text-zinc-700 border-zinc-500/30',
  incomplete_expired: 'bg-zinc-500/15 text-zinc-700 border-zinc-500/30',
};

const billingStatusStyles: Record<BillingCycleStatus, string> = {
  draft: 'bg-slate-500/15 text-slate-700 border-slate-500/30',
  open: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
  paid: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  uncollectible: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
  void: 'bg-zinc-500/15 text-zinc-700 border-zinc-500/30',
};

const failureClassStyles: Record<FailureClass, string> = {
  recoverable_transient: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
  requires_customer_action: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  hard_failure: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
};

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  return (
    <Badge variant='outline' className={cn('border', subscriptionStatusStyles[status])}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

export function BillingStatusBadge({ status }: { status: BillingCycleStatus }) {
  return (
    <Badge variant='outline' className={cn('border', billingStatusStyles[status])}>
      {status}
    </Badge>
  );
}

export function FailureClassBadge({ failureClass }: { failureClass: FailureClass }) {
  return (
    <Badge variant='outline' className={cn('border', failureClassStyles[failureClass])}>
      {failureClass.replaceAll('_', ' ')}
    </Badge>
  );
}
