export type SubscriptionStatus =
  | 'trialing'
  | 'incomplete'
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'paused'
  | 'canceled'
  | 'incomplete_expired';

export type BillingCycleStatus = 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';

export type BillingAttemptStatus = 'pending' | 'confirmed' | 'failed';

export type FailureClass = 'recoverable_transient' | 'requires_customer_action' | 'hard_failure';

export type SettlementStatus = 'pending' | 'confirmed' | 'failed';

export type TerminalFailureStatus = 'unpaid' | 'canceled' | 'past_due';

export type PlanInterval = 'monthly' | 'yearly' | 'custom';

export type PlanStatus = 'active' | 'archived';

export type PlanTemplate = {
  id: string;
  merchantAddress: string;
  planRef?: string;
  name: string;
  description?: string;
  interval: PlanInterval;
  billingIntervalSeconds: number;
  amountRefMicros: string;
  status: PlanStatus;
  checkoutSlug: string;
  createdAt: string;
  updatedAt: string;
};

// Backwards compatibility: older code uses MerchantPlan naming.
export type MerchantPlan = PlanTemplate;

export type SubscriptionAgreement = {
  id: string;
  merchantAddress: string;
  subscriptionRef?: string;
  planRef?: string;
  customerCardAddress: string;
  customerSmartWallet?: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextChargeAt?: string;
  lastChargeAt?: string;
  failureCount?: number;
  maxAllowanceRefMicros?: string;
  maxAllowanceHandle?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type BillingCycle = {
  id: string;
  merchantAddress: string;
  subscriptionId: string;
  cycleStart: string;
  cycleEnd: string;
  status: BillingCycleStatus;
  attemptCount: number;
  nextAttemptAt?: string;
  lastFailureClass?: FailureClass;
  lastFailureReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type BillingAttempt = {
  id: string;
  merchantAddress: string;
  subscriptionId: string;
  billingCycleId: string;
  attemptNumber: number;
  idempotencyKey?: string;
  requestedAmountRef: string;
  pulledAmountRef?: string;
  userOpHash?: string;
  txHash?: string;
  status: BillingAttemptStatus;
  failureClass?: FailureClass;
  failureReason?: string;
  startedAt: string;
  resolvedAt?: string;
};

export type Settlement = {
  id: string;
  merchantAddress: string;
  amountRef: string;
  userOpHash?: string;
  txHash?: string;
  status: SettlementStatus;
  failureReason?: string;
  createdAt: string;
  resolvedAt?: string;
};

export type EventLedgerItem = {
  id: string;
  merchantAddress: string;
  type: string;
  resourceId?: string;
  payload?: Record<string, string | number | boolean | null>;
  createdAt: string;
};

export type RecoveryPolicy = {
  maxAttempts: number;
  retryWindowsMinutes: number[];
  terminalStatusOnExhausted: TerminalFailureStatus;
};

export type MerchantControlPlaneState = {
  version: number;
  merchantAddress: string;
  plans: MerchantPlan[];
  subscriptions: SubscriptionAgreement[];
  cycles: BillingCycle[];
  attempts: BillingAttempt[];
  settlements: Settlement[];
  events: EventLedgerItem[];
  recoveryPolicy: RecoveryPolicy;
  createdAt: string;
  updatedAt: string;
};

export type MerchantMetrics = {
  subscriptionsActive: number;
  subscriptionsPastDue: number;
  subscriptionsUnpaid: number;
  subscriptionsPaused: number;
  cyclesOpen: number;
  failedToday: number;
  paidToday: number;
  recoveryAtRisk: number;
  mrrProxyMicros: bigint;
};

export type RecoveryQueueItem = {
  cycle: BillingCycle;
  subscription: SubscriptionAgreement | null;
  latestAttempt: BillingAttempt | null;
  priorityScore: number;
};
