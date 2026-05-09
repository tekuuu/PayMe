'use client';

import { Badge } from '@/components/ui/badge';
import type { BillingCycleStatus, FailureClass, SubscriptionStatus } from '@/lib/merchant/types';
import { cn } from '@/lib/utils';
import { statusBadgeClasses } from '@/lib/design-system';

const subscriptionStatusStyles: Record<SubscriptionStatus, string> = {
  trialing: statusBadgeClasses.incomplete,
  incomplete: statusBadgeClasses.incomplete,
  active: statusBadgeClasses.active,
  past_due: statusBadgeClasses.past_due,
  unpaid: statusBadgeClasses.unpaid,
  paused: statusBadgeClasses.paused,
  canceled: statusBadgeClasses.canceled,
  incomplete_expired: statusBadgeClasses.incomplete_expired,
};

const billingStatusStyles: Record<BillingCycleStatus, string> = {
  draft: statusBadgeClasses.draft,
  open: statusBadgeClasses.open,
  paid: statusBadgeClasses.paid,
  uncollectible: statusBadgeClasses.uncollectible,
  void: statusBadgeClasses.void,
};

const failureClassStyles: Record<FailureClass, string> = {
  recoverable_transient: statusBadgeClasses.recoverable_transient,
  requires_customer_action: statusBadgeClasses.requires_customer_action,
  hard_failure: statusBadgeClasses.hard_failure,
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
