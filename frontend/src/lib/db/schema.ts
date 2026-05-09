// @ts-nocheck
import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  bigint,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const planStatusEnum = pgEnum('plan_status', ['active', 'archived']);
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trialing',
  'incomplete',
  'active',
  'past_due',
  'unpaid',
  'paused',
  'canceled',
  'incomplete_expired',
]);
export const billingCycleStatusEnum = pgEnum('billing_cycle_status', [
  'draft',
  'open',
  'paid',
  'uncollectible',
  'void',
]);
export const billingAttemptStatusEnum = pgEnum('billing_attempt_status', [
  'pending',
  'confirmed',
  'failed',
]);
export const activityTypeEnum = pgEnum('activity_type', [
  'shield',
  'unshield',
  'send',
  'subscribe',
  'cancel_subscription',
  'pause_subscription',
  'resume_subscription',
  'card_created',
  'card_linked',
  'card_unlinked',
  'payment_received',
]);
export const activityStatusEnum = pgEnum('activity_status', [
  'pending',
  'confirmed',
  'failed',
]);

export const merchantPlans = pgTable(
  'merchant_plans',
  {
    id: text('id').primaryKey(),
    merchantAddress: text('merchant_address').notNull(),
    planRef: text('plan_ref'),
    name: text('name').notNull(),
    description: text('description'),
    interval: text('interval').notNull(),
    billingIntervalSeconds: integer('billing_interval_seconds').notNull(),
    amountRefMicros: text('amount_ref_micros').notNull(),
    status: planStatusEnum('status').notNull().default('active'),
    checkoutSlug: text('checkout_slug'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    merchantIdx: index('idx_plans_merchant').on(table.merchantAddress),
  })
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: text('id').primaryKey(),
    merchantAddress: text('merchant_address').notNull(),
    subscriptionRef: text('subscription_ref'),
    planRef: text('plan_ref'),
    planId: text('plan_id').notNull(),
    customerCardAddress: text('customer_card_address').notNull(),
    customerSmartWallet: text('customer_smart_wallet'),
    status: subscriptionStatusEnum('status').notNull().default('active'),
    currentPeriodStart: timestamp('current_period_start').notNull().defaultNow(),
    currentPeriodEnd: timestamp('current_period_end').notNull().defaultNow(),
    nextChargeAt: timestamp('next_charge_at'),
    lastChargeAt: timestamp('last_charge_at'),
    failureCount: integer('failure_count').default(0),
    maxAllowanceRefMicros: text('max_allowance_ref_micros'),
    maxAllowanceHandle: text('max_allowance_handle'),
    cancelAtPeriodEnd: integer('cancel_at_period_end').default(0),
    canceledAt: timestamp('canceled_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    merchantIdx: index('idx_subs_merchant').on(table.merchantAddress),
    cardIdx: index('idx_subs_card').on(table.customerCardAddress),
    statusIdx: index('idx_subs_status').on(table.status),
  })
);

export const billingCycles = pgTable(
  'billing_cycles',
  {
    id: text('id').primaryKey(),
    merchantAddress: text('merchant_address').notNull(),
    subscriptionId: text('subscription_id').notNull(),
    cycleStart: timestamp('cycle_start').notNull().defaultNow(),
    cycleEnd: timestamp('cycle_end').notNull().defaultNow(),
    status: billingCycleStatusEnum('status').notNull().default('draft'),
    attemptCount: integer('attempt_count').default(0),
    nextAttemptAt: timestamp('next_attempt_at'),
    lastFailureClass: text('last_failure_class'),
    lastFailureReason: text('last_failure_reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    merchantIdx: index('idx_cycles_merchant').on(table.merchantAddress),
    subscriptionIdx: index('idx_cycles_subscription').on(table.subscriptionId),
  })
);

export const billingAttempts = pgTable(
  'billing_attempts',
  {
    id: text('id').primaryKey(),
    merchantAddress: text('merchant_address').notNull(),
    subscriptionId: text('subscription_id').notNull(),
    billingCycleId: text('billing_cycle_id').notNull(),
    attemptNumber: integer('attempt_number').notNull(),
    idempotencyKey: text('idempotency_key'),
    requestedAmountRef: text('requested_amount_ref').notNull(),
    pulledAmountRef: text('pulled_amount_ref'),
    userOpHash: text('user_op_hash'),
    txHash: text('tx_hash'),
    status: billingAttemptStatusEnum('status').notNull().default('pending'),
    failureClass: text('failure_class'),
    failureReason: text('failure_reason'),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at'),
  },
  (table) => ({
    merchantIdx: index('idx_attempts_merchant').on(table.merchantAddress),
    cycleIdx: index('idx_attempts_cycle').on(table.billingCycleId),
    txHashIdx: uniqueIndex('idx_attempts_txhash').on(table.txHash),
  })
);

export const customerActivities = pgTable(
  'customer_activities',
  {
    id: text('id').primaryKey(),
    walletAddress: text('wallet_address').notNull(),
    cardAddress: text('card_address'),
    type: activityTypeEnum('type').notNull(),
    status: activityStatusEnum('status').notNull().default('confirmed'),
    amount: text('amount'),
    token: text('token'),
    counterparty: text('counterparty'),
    merchantAddress: text('merchant_address'),
    planName: text('plan_name'),
    subscriptionId: text('subscription_id'),
    txHash: text('tx_hash'),
    userOpHash: text('user_op_hash'),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    confirmedAt: timestamp('confirmed_at'),
  },
  (table) => ({
    walletIdx: index('idx_activities_wallet').on(
      table.walletAddress,
      table.createdAt.desc()
    ),
    cardIdx: index('idx_activities_card').on(
      table.cardAddress,
      table.createdAt.desc()
    ),
  })
);
