import { getAddress, isAddress, keccak256, stringToHex } from 'viem';
import type {
  BillingAttempt,
  BillingCycle,
  EventLedgerItem,
  MerchantControlPlaneState,
  MerchantMetrics,
  MerchantPlan,
  PlanInterval,
  PlanStatus,
  RecoveryPolicy,
  RecoveryQueueItem,
  SubscriptionAgreement,
  TerminalFailureStatus,
} from '@/lib/merchant/types';
import { encodeCheckoutSlug } from '@/lib/merchant/checkout-slug';

const STATE_VERSION = 2;
const DEFAULT_INTERVAL_SECONDS = 30 * 24 * 60 * 60;
const DEFAULT_RETRY_WINDOWS = [10, 60, 360, 1440, 4320];
const DEFAULT_MAX_ATTEMPTS = 5;
const STORAGE_PREFIX = 'payme.merchant.control-plane.';
const CUSTOMER_CARD_INDEX_PREFIX = 'payme.customer.cardSubscriptions.';
export const MERCHANT_CONTROL_PLANE_EVENT = 'payme:merchant-control-plane-updated';

type PartialRecoveryPolicy = Partial<RecoveryPolicy>;

export type BeginBillingAttemptInput = {
  merchantAddress: string;
  customerCardAddress: string;
  requestedAmountRef: string;
  customerSmartWallet?: string;
  planName?: string;
  periodSeconds?: number;
  idempotencyKey?: string;
};

export type BeginBillingAttemptResult = {
  subscriptionId: string;
  billingCycleId: string;
  attemptId: string;
};

export type FinalizeBillingAttemptInput = {
  merchantAddress: string;
  attemptId: string;
  userOpHash?: string;
  txHash?: string;
};

export type FinalizeBillingAttemptSuccessInput = FinalizeBillingAttemptInput & {
  pulledAmountRef?: string;
};

export type FinalizeBillingAttemptFailureInput = FinalizeBillingAttemptInput & {
  errorMessage: string;
};

export type BeginSettlementInput = {
  merchantAddress: string;
  amountRef: string;
};

export type BeginSettlementResult = {
  settlementId: string;
};

export type RegisterSubscriptionApprovalInput = {
  merchantAddress: string;
  customerCardAddress: string;
  customerSmartWallet?: string;
  planId?: string;
  planRef?: string;
  subscriptionRef?: string;
  amountRef?: string;
  amountHandle?: string;
  periodSeconds?: number;
  planName?: string;
};

export type RegisterSubscriptionApprovalResult = {
  subscriptionId: string;
  cycleId: string;
};

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function createOpaqueRef(prefix: string, ...parts: (string | number | undefined)[]) {
  const seed = [prefix, Date.now(), Math.random(), ...parts].map((entry) => String(entry ?? '')).join('|');
  return keccak256(stringToHex(seed));
}

function clampReason(reason: string) {
  return reason.length > 320 ? `${reason.slice(0, 320)}...` : reason;
}

function normalizeAddress(value: string) {
  if (!isAddress(value)) {
    throw new Error(`Invalid address: ${value}`);
  }

  return getAddress(value);
}

function storageKey(merchantAddress: string) {
  return `${STORAGE_PREFIX}${merchantAddress.toLowerCase()}`;
}

function customerCardIndexKey(customerCardAddress: string) {
  return `${CUSTOMER_CARD_INDEX_PREFIX}${customerCardAddress.toLowerCase()}`;
}

function addMerchantToCustomerCardIndex(customerCardAddress: string, merchantAddress: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const key = customerCardIndexKey(customerCardAddress);
  const current = listMerchantsForCustomerCard(customerCardAddress);
  const merged = Array.from(
    new Set([...current.map((entry) => entry.toLowerCase()), merchantAddress.toLowerCase()])
  );
  window.localStorage.setItem(key, JSON.stringify(merged));
}

function defaultRecoveryPolicy(): RecoveryPolicy {
  return {
    maxAttempts: DEFAULT_MAX_ATTEMPTS,
    retryWindowsMinutes: [...DEFAULT_RETRY_WINDOWS],
    terminalStatusOnExhausted: 'unpaid',
  };
}

export function createEmptyMerchantState(merchantAddress: string): MerchantControlPlaneState {
  const normalized = normalizeAddress(merchantAddress);
  const timestamp = nowIso();
  return {
    version: STATE_VERSION,
    merchantAddress: normalized,
    plans: [],
    subscriptions: [],
    cycles: [],
    attempts: [],
    settlements: [],
    events: [],
    recoveryPolicy: defaultRecoveryPolicy(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function sanitizeState(
  merchantAddress: string,
  raw: Partial<MerchantControlPlaneState> | null | undefined
): MerchantControlPlaneState {
  const fallback = createEmptyMerchantState(merchantAddress);
  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const normalizedPlans = (Array.isArray(raw.plans) ? raw.plans : []).map((plan: any) => {
    const billingIntervalSeconds =
      Number.isFinite(plan?.billingIntervalSeconds) && plan.billingIntervalSeconds > 0
        ? Math.floor(plan.billingIntervalSeconds)
        : DEFAULT_INTERVAL_SECONDS;
    const id = typeof plan?.id === 'string' && plan.id ? plan.id : createId('plan_legacy');
    const name = typeof plan?.name === 'string' && plan.name.trim().length > 0 ? plan.name : 'Plan';
    const description = typeof plan?.description === 'string' ? plan.description : '';
    const planRef =
      typeof plan?.planRef === 'string' && /^0x[0-9a-fA-F]{64}$/.test(plan.planRef)
        ? plan.planRef
        : createOpaqueRef('plan', fallback.merchantAddress, id, name);
    const interval: PlanInterval = plan?.interval || intervalFromSeconds(billingIntervalSeconds);
    const amountRefMicros = clampAmountRefMicros(plan?.amountRefMicros ?? plan?.amountRef);
    const status: PlanStatus =
      plan?.status === 'archived' || plan?.active === false ? 'archived' : 'active';
    const checkoutSlug =
      typeof plan?.checkoutSlug === 'string' && plan.checkoutSlug
        ? plan.checkoutSlug
        : encodeCheckoutSlug({
            v: 1,
            merchantAddress: fallback.merchantAddress,
            planId: id,
            planRef,
            name,
            description,
            interval,
            billingIntervalSeconds,
            amountRefMicros,
          });

    return {
      id,
      merchantAddress: fallback.merchantAddress,
      planRef,
      name,
      description,
      interval,
      billingIntervalSeconds,
      amountRefMicros,
      status,
      checkoutSlug,
      createdAt: typeof plan?.createdAt === 'string' ? plan.createdAt : fallback.createdAt,
      updatedAt: typeof plan?.updatedAt === 'string' ? plan.updatedAt : fallback.updatedAt,
    } as MerchantPlan;
  });

  const normalizedSubscriptions = (Array.isArray(raw.subscriptions) ? raw.subscriptions : []).map((sub: any) => {
    const currentPeriodEnd = typeof sub?.currentPeriodEnd === 'string' ? sub.currentPeriodEnd : fallback.createdAt;
    const nextChargeAt = typeof sub?.nextChargeAt === 'string' ? sub.nextChargeAt : currentPeriodEnd;
    const normalizedPlanId = typeof sub?.planId === 'string' ? sub.planId : '';
    const planForSubscription = normalizedPlans.find((plan) => plan.id === normalizedPlanId);
    const planRef =
      typeof sub?.planRef === 'string' && /^0x[0-9a-fA-F]{64}$/.test(sub.planRef)
        ? sub.planRef
        : (planForSubscription?.planRef || createOpaqueRef('plan_link', fallback.merchantAddress, normalizedPlanId));
    const subscriptionRef =
      typeof sub?.subscriptionRef === 'string' && /^0x[0-9a-fA-F]{64}$/.test(sub.subscriptionRef)
        ? sub.subscriptionRef
        : createOpaqueRef('sub_legacy', fallback.merchantAddress, sub?.customerCardAddress, normalizedPlanId, sub?.createdAt);
    return {
      ...sub,
      merchantAddress: fallback.merchantAddress,
      planRef,
      subscriptionRef,
      nextChargeAt,
      failureCount: Number.isFinite(sub?.failureCount) ? Math.max(0, Math.floor(sub.failureCount)) : 0,
    } as SubscriptionAgreement;
  });

  return {
    ...fallback,
    ...raw,
    version: STATE_VERSION,
    merchantAddress: fallback.merchantAddress,
    plans: normalizedPlans,
    subscriptions: normalizedSubscriptions,
    cycles: Array.isArray(raw.cycles) ? raw.cycles : [],
    attempts: Array.isArray(raw.attempts) ? raw.attempts : [],
    settlements: Array.isArray(raw.settlements) ? raw.settlements : [],
    events: Array.isArray(raw.events) ? raw.events : [],
    recoveryPolicy: {
      ...defaultRecoveryPolicy(),
      ...(raw.recoveryPolicy || {}),
      retryWindowsMinutes: Array.isArray(raw.recoveryPolicy?.retryWindowsMinutes)
        ? raw.recoveryPolicy?.retryWindowsMinutes.filter((v): v is number => Number.isFinite(v) && v > 0)
        : [...DEFAULT_RETRY_WINDOWS],
    },
  };
}

function appendEvent(
  state: MerchantControlPlaneState,
  type: string,
  resourceId?: string,
  payload?: Record<string, string | number | boolean | null>
) {
  const event: EventLedgerItem = {
    id: createId('evt'),
    merchantAddress: state.merchantAddress,
    type,
    resourceId,
    payload,
    createdAt: nowIso(),
  };
  state.events.unshift(event);
  state.events = state.events.slice(0, 500);
}

function getPlanById(state: MerchantControlPlaneState, planId: string): MerchantPlan | undefined {
  return state.plans.find((plan) => plan.id === planId);
}

function intervalFromSeconds(seconds: number): PlanInterval {
  const days = seconds / 86400;
  if (days > 25 && days < 35) return 'monthly';
  if (days > 330 && days < 400) return 'yearly';
  return 'custom';
}

function clampAmountRefMicros(value: string | number | undefined) {
  if (value === undefined || value === null) return '0';
  const raw = String(value).trim();
  if (!raw) return '0';
  try {
    const asBigint = BigInt(raw);
    return asBigint < 0n ? '0' : asBigint.toString();
  } catch {
    return '0';
  }
}

function ensurePlan(
  state: MerchantControlPlaneState,
  name?: string,
  periodSeconds?: number,
  amountRefMicros?: string
): MerchantPlan {
  const normalizedName = (name || 'Default Monthly').trim();
  const normalizedInterval = Number.isFinite(periodSeconds) && periodSeconds && periodSeconds > 0
    ? Math.floor(periodSeconds)
    : DEFAULT_INTERVAL_SECONDS;

  const existing = state.plans.find(
    (plan) =>
      plan.status === 'active' &&
      plan.name.toLowerCase() === normalizedName.toLowerCase() &&
      plan.billingIntervalSeconds === normalizedInterval
  );

  if (existing) {
    if (amountRefMicros && clampAmountRefMicros(existing.amountRefMicros) === '0') {
      existing.amountRefMicros = clampAmountRefMicros(amountRefMicros);
      existing.updatedAt = nowIso();
      existing.checkoutSlug = encodeCheckoutSlug({
        v: 1,
        merchantAddress: state.merchantAddress,
        planId: existing.id,
        planRef: existing.planRef || createOpaqueRef('plan', state.merchantAddress, existing.id),
        name: existing.name,
        description: existing.description || '',
        interval: existing.interval,
        billingIntervalSeconds: existing.billingIntervalSeconds,
        amountRefMicros: existing.amountRefMicros,
      });
    }
    return existing;
  }

  const timestamp = nowIso();
  const plan: MerchantPlan = {
    id: createId('plan'),
    merchantAddress: state.merchantAddress,
    planRef: createOpaqueRef('plan', state.merchantAddress, normalizedName),
    name: normalizedName,
    description: '',
    interval: intervalFromSeconds(normalizedInterval),
    billingIntervalSeconds: normalizedInterval,
    amountRefMicros: clampAmountRefMicros(amountRefMicros),
    status: 'active',
    checkoutSlug: '',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  plan.checkoutSlug = encodeCheckoutSlug({
    v: 1,
    merchantAddress: state.merchantAddress,
    planId: plan.id,
    planRef: plan.planRef || createOpaqueRef('plan', state.merchantAddress, plan.id),
    name: plan.name,
    description: plan.description || '',
    interval: plan.interval,
    billingIntervalSeconds: plan.billingIntervalSeconds,
    amountRefMicros: plan.amountRefMicros,
  });
  state.plans.unshift(plan);
  appendEvent(state, 'plan.created', plan.id, {
    intervalSeconds: normalizedInterval,
    name: normalizedName,
  });
  return plan;
}

export function createPlanTemplate(input: {
  merchantAddress: string;
  name: string;
  description?: string;
  interval: PlanInterval;
  billingIntervalSeconds: number;
  amountRefMicros: string;
}): MerchantPlan {
  const state = readMerchantState(input.merchantAddress);
  const timestamp = nowIso();

  const plan: MerchantPlan = {
    id: createId('plan'),
    merchantAddress: state.merchantAddress,
    planRef: createOpaqueRef('plan', state.merchantAddress, input.name),
    name: input.name.trim() || 'Untitled Plan',
    description: (input.description || '').trim(),
    interval: input.interval,
    billingIntervalSeconds: Math.max(60, Math.floor(input.billingIntervalSeconds)),
    amountRefMicros: clampAmountRefMicros(input.amountRefMicros),
    status: 'active',
    checkoutSlug: '',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  plan.checkoutSlug = encodeCheckoutSlug({
    v: 1,
    merchantAddress: state.merchantAddress,
    planId: plan.id,
    planRef: plan.planRef || createOpaqueRef('plan', state.merchantAddress, plan.id),
    name: plan.name,
    description: plan.description || '',
    interval: plan.interval,
    billingIntervalSeconds: plan.billingIntervalSeconds,
    amountRefMicros: plan.amountRefMicros,
  });

  state.plans.unshift(plan);
  appendEvent(state, 'plan.created', plan.id, {
    interval: plan.interval,
    amountRefMicros: plan.amountRefMicros,
    name: plan.name,
  });
  writeMerchantState(input.merchantAddress, state);
  return plan;
}

export function updatePlanTemplate(
  merchantAddress: string,
  planId: string,
  patch: Partial<Pick<MerchantPlan, 'name' | 'description' | 'interval' | 'billingIntervalSeconds' | 'amountRefMicros' | 'status'>>
) {
  const state = readMerchantState(merchantAddress);
  const plan = state.plans.find((entry) => entry.id === planId);
  if (!plan) return state;

  if (patch.name !== undefined) plan.name = patch.name.trim() || plan.name;
  if (patch.description !== undefined) plan.description = patch.description;
  if (patch.interval !== undefined) plan.interval = patch.interval;
  if (patch.billingIntervalSeconds !== undefined) {
    plan.billingIntervalSeconds = Math.max(60, Math.floor(patch.billingIntervalSeconds));
  }
  if (patch.amountRefMicros !== undefined) plan.amountRefMicros = clampAmountRefMicros(patch.amountRefMicros);
  if (patch.status !== undefined) plan.status = patch.status as PlanStatus;

  plan.updatedAt = nowIso();
  plan.checkoutSlug = encodeCheckoutSlug({
    v: 1,
    merchantAddress: state.merchantAddress,
    planId: plan.id,
    planRef: plan.planRef || createOpaqueRef('plan', state.merchantAddress, plan.id),
    name: plan.name,
    description: plan.description || '',
    interval: plan.interval,
    billingIntervalSeconds: plan.billingIntervalSeconds,
    amountRefMicros: plan.amountRefMicros,
  });

  appendEvent(state, 'plan.updated', plan.id);
  writeMerchantState(merchantAddress, state);
  return state;
}

export function archivePlanTemplate(merchantAddress: string, planId: string) {
  return updatePlanTemplate(merchantAddress, planId, { status: 'archived' });
}

function ensureSubscription(
  state: MerchantControlPlaneState,
  params: {
    customerCardAddress: string;
    customerSmartWallet?: string;
    plan: MerchantPlan;
    planRef?: string;
    subscriptionRef?: string;
    amountRefMicros?: string;
    amountHandle?: string;
  }
) {
  const card = normalizeAddress(params.customerCardAddress);
  const now = new Date();

  const existing = state.subscriptions
    .filter((subscription) => subscription.customerCardAddress.toLowerCase() === card.toLowerCase())
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

  if (existing && existing.status !== 'canceled') {
    if (params.customerSmartWallet) {
      existing.customerSmartWallet = params.customerSmartWallet;
    }
    existing.planId = params.plan.id;
    existing.planRef = params.planRef || params.plan.planRef || existing.planRef;
    existing.subscriptionRef = params.subscriptionRef || existing.subscriptionRef;
    if (params.amountRefMicros) {
      existing.maxAllowanceRefMicros = params.amountRefMicros;
    }
    if (params.amountHandle) {
      existing.maxAllowanceHandle = params.amountHandle;
    }
    existing.updatedAt = nowIso();
    return existing;
  }

  const start = now.toISOString();
  const end = new Date(now.getTime() + params.plan.billingIntervalSeconds * 1000).toISOString();
  const subscription: SubscriptionAgreement = {
    id: createId('sub'),
    merchantAddress: state.merchantAddress,
    subscriptionRef: params.subscriptionRef || createOpaqueRef('sub', state.merchantAddress, card, params.plan.id),
    planRef: params.planRef || params.plan.planRef,
    customerCardAddress: card,
    customerSmartWallet: params.customerSmartWallet,
    planId: params.plan.id,
    status: 'incomplete',
    startedAt: start,
    currentPeriodStart: start,
    currentPeriodEnd: end,
    nextChargeAt: end,
    lastChargeAt: undefined,
    failureCount: 0,
    maxAllowanceRefMicros: params.amountRefMicros,
    maxAllowanceHandle: params.amountHandle,
    cancelAtPeriodEnd: false,
    createdAt: start,
    updatedAt: start,
  };

  state.subscriptions.unshift(subscription);
  appendEvent(state, 'subscription.created', subscription.id, {
    customerCardAddress: subscription.customerCardAddress,
    status: subscription.status,
  });

  return subscription;
}

function ensureCurrentCycle(state: MerchantControlPlaneState, subscription: SubscriptionAgreement) {
  const now = new Date();
  const current = state.cycles.find(
    (cycle) =>
      cycle.subscriptionId === subscription.id &&
      (cycle.status === 'draft' || cycle.status === 'open') &&
      new Date(cycle.cycleEnd).getTime() >= now.getTime()
  );

  if (current) {
    return current;
  }

  const plan = getPlanById(state, subscription.planId);
  const intervalSeconds = plan?.billingIntervalSeconds || DEFAULT_INTERVAL_SECONDS;

  const cycleStart = now.toISOString();
  const cycleEnd = new Date(now.getTime() + intervalSeconds * 1000).toISOString();
  const cycle: BillingCycle = {
    id: createId('cyc'),
    merchantAddress: state.merchantAddress,
    subscriptionId: subscription.id,
    cycleStart,
    cycleEnd,
    status: 'draft',
    attemptCount: 0,
    createdAt: cycleStart,
    updatedAt: cycleStart,
  };

  subscription.currentPeriodStart = cycleStart;
  subscription.currentPeriodEnd = cycleEnd;
  subscription.nextChargeAt = cycleEnd;
  subscription.updatedAt = nowIso();

  state.cycles.unshift(cycle);
  appendEvent(state, 'billing_cycle.created', cycle.id, {
    subscriptionId: subscription.id,
  });

  return cycle;
}

function classifyFailure(errorMessage: string) {
  const normalized = errorMessage.toLowerCase();

  if (
    normalized.includes('allowance') ||
    normalized.includes('no subscription') ||
    normalized.includes('customer action') ||
    normalized.includes('approve') ||
    normalized.includes('insufficient')
  ) {
    return 'requires_customer_action' as const;
  }

  if (
    normalized.includes('rpc') ||
    normalized.includes('timeout') ||
    normalized.includes('tempor') ||
    normalized.includes('network') ||
    normalized.includes('bundler')
  ) {
    return 'recoverable_transient' as const;
  }

  return 'hard_failure' as const;
}

function retryAtFromAttempt(
  policy: RecoveryPolicy,
  attemptNumber: number,
  timestampMs: number
) {
  const index = Math.max(0, Math.min(attemptNumber - 1, policy.retryWindowsMinutes.length - 1));
  const delayMinutes = policy.retryWindowsMinutes[index] ?? policy.retryWindowsMinutes.at(-1) ?? 60;
  return new Date(timestampMs + delayMinutes * 60 * 1000).toISOString();
}

function finalizeSuccess(state: MerchantControlPlaneState, attempt: BillingAttempt, pulledAmountRef?: string) {
  const timestamp = nowIso();
  attempt.status = 'confirmed';
  attempt.pulledAmountRef = pulledAmountRef || attempt.requestedAmountRef;
  attempt.resolvedAt = timestamp;

  const cycle = state.cycles.find((entry) => entry.id === attempt.billingCycleId);
  if (cycle) {
    cycle.status = 'paid';
    cycle.nextAttemptAt = undefined;
    cycle.lastFailureClass = undefined;
    cycle.lastFailureReason = undefined;
    cycle.updatedAt = timestamp;
  }

  const subscription = state.subscriptions.find((entry) => entry.id === attempt.subscriptionId);
  if (subscription && subscription.status !== 'canceled' && subscription.status !== 'paused') {
    const plan = getPlanById(state, subscription.planId);
    const intervalSeconds = plan?.billingIntervalSeconds || DEFAULT_INTERVAL_SECONDS;
    const cycleStart = timestamp;
    const cycleEnd = new Date(Date.now() + intervalSeconds * 1000).toISOString();
    subscription.status = 'active';
    subscription.currentPeriodStart = cycleStart;
    subscription.currentPeriodEnd = cycleEnd;
    subscription.nextChargeAt = cycleEnd;
    subscription.lastChargeAt = timestamp;
    subscription.failureCount = 0;
    subscription.updatedAt = timestamp;
  }

  appendEvent(state, 'billing_attempt.confirmed', attempt.id, {
    subscriptionId: attempt.subscriptionId,
    billingCycleId: attempt.billingCycleId,
  });
}

function finalizeFailure(
  state: MerchantControlPlaneState,
  attempt: BillingAttempt,
  errorMessage: string
) {
  const timestamp = Date.now();
  const timestampIso = new Date(timestamp).toISOString();
  const failureClass = classifyFailure(errorMessage);
  const reason = clampReason(errorMessage);
  attempt.status = 'failed';
  attempt.failureClass = failureClass;
  attempt.failureReason = reason;
  attempt.resolvedAt = timestampIso;

  const cycle = state.cycles.find((entry) => entry.id === attempt.billingCycleId);
  const subscription = state.subscriptions.find((entry) => entry.id === attempt.subscriptionId);
  if (subscription) {
    subscription.failureCount = (subscription.failureCount ?? 0) + 1;
    subscription.updatedAt = timestampIso;
  }

  if (cycle) {
    cycle.lastFailureClass = failureClass;
    cycle.lastFailureReason = reason;
    const exhausted = cycle.attemptCount >= state.recoveryPolicy.maxAttempts;

    if (exhausted) {
      cycle.status = 'uncollectible';
      cycle.nextAttemptAt = undefined;
      if (subscription) {
        const terminalStatus = state.recoveryPolicy.terminalStatusOnExhausted;
        subscription.status = terminalStatus as TerminalFailureStatus;
        subscription.updatedAt = timestampIso;
        if (terminalStatus === 'canceled') {
          subscription.canceledAt = timestampIso;
        }
      }
    } else {
      cycle.status = 'open';
      cycle.nextAttemptAt = retryAtFromAttempt(state.recoveryPolicy, cycle.attemptCount, timestamp);
      if (subscription && subscription.status !== 'canceled' && subscription.status !== 'paused') {
        subscription.status = 'past_due';
        subscription.updatedAt = timestampIso;
      }
    }
    cycle.updatedAt = timestampIso;
  }

  appendEvent(state, 'billing_attempt.failed', attempt.id, {
    subscriptionId: attempt.subscriptionId,
    billingCycleId: attempt.billingCycleId,
    failureClass,
  });
}

export function readMerchantState(merchantAddress: string) {
  const normalizedMerchant = normalizeAddress(merchantAddress);
  if (typeof window === 'undefined') {
    return createEmptyMerchantState(normalizedMerchant);
  }

  const raw = window.localStorage.getItem(storageKey(normalizedMerchant));
  if (!raw) {
    return createEmptyMerchantState(normalizedMerchant);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MerchantControlPlaneState>;
    return sanitizeState(normalizedMerchant, parsed);
  } catch {
    return createEmptyMerchantState(normalizedMerchant);
  }
}

export function writeMerchantState(merchantAddress: string, state: MerchantControlPlaneState) {
  const normalizedMerchant = normalizeAddress(merchantAddress);
  if (typeof window === 'undefined') {
    return;
  }

  const payload: MerchantControlPlaneState = {
    ...state,
    version: STATE_VERSION,
    merchantAddress: normalizedMerchant,
    updatedAt: nowIso(),
  };

  window.localStorage.setItem(storageKey(normalizedMerchant), JSON.stringify(payload));
  window.dispatchEvent(
    new CustomEvent(MERCHANT_CONTROL_PLANE_EVENT, {
      detail: {
        merchantAddress: normalizedMerchant,
      },
    })
  );
}

export function upsertRecoveryPolicy(merchantAddress: string, patch: PartialRecoveryPolicy) {
  const state = readMerchantState(merchantAddress);
  const next: RecoveryPolicy = {
    ...state.recoveryPolicy,
    ...patch,
  };

  next.maxAttempts = Math.max(1, Math.min(20, Math.floor(next.maxAttempts || DEFAULT_MAX_ATTEMPTS)));
  next.retryWindowsMinutes = (next.retryWindowsMinutes || [])
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => Math.floor(value));

  if (next.retryWindowsMinutes.length === 0) {
    next.retryWindowsMinutes = [...DEFAULT_RETRY_WINDOWS];
  }

  state.recoveryPolicy = next;
  appendEvent(state, 'recovery_policy.updated', undefined, {
    maxAttempts: state.recoveryPolicy.maxAttempts,
    terminalStatus: state.recoveryPolicy.terminalStatusOnExhausted,
  });
  writeMerchantState(merchantAddress, state);
  return state;
}

export function beginBillingAttempt(input: BeginBillingAttemptInput): BeginBillingAttemptResult {
  const state = readMerchantState(input.merchantAddress);
  const plan = ensurePlan(state, input.planName, input.periodSeconds, input.requestedAmountRef);
  const subscription = ensureSubscription(state, {
    customerCardAddress: input.customerCardAddress,
    customerSmartWallet: input.customerSmartWallet,
    plan,
    amountRefMicros: input.requestedAmountRef,
  });
  const cycle = ensureCurrentCycle(state, subscription);

  const idempotencyKey = input.idempotencyKey?.trim();
  if (idempotencyKey) {
    const existing = state.attempts.find(
      (entry) =>
        entry.merchantAddress.toLowerCase() === state.merchantAddress.toLowerCase() &&
        entry.idempotencyKey === idempotencyKey &&
        entry.status === 'pending'
    );
    if (existing) {
      return {
        subscriptionId: existing.subscriptionId,
        billingCycleId: existing.billingCycleId,
        attemptId: existing.id,
      };
    }
  }

  const attempt: BillingAttempt = {
    id: createId('att'),
    merchantAddress: state.merchantAddress,
    subscriptionId: subscription.id,
    billingCycleId: cycle.id,
    attemptNumber: cycle.attemptCount + 1,
    idempotencyKey: idempotencyKey || undefined,
    requestedAmountRef: input.requestedAmountRef,
    status: 'pending',
    startedAt: nowIso(),
  };

  cycle.status = 'open';
  cycle.attemptCount += 1;
  cycle.nextAttemptAt = undefined;
  cycle.updatedAt = nowIso();
  state.attempts.unshift(attempt);

  appendEvent(state, 'billing_attempt.started', attempt.id, {
    subscriptionId: attempt.subscriptionId,
    billingCycleId: cycle.id,
    attemptNumber: attempt.attemptNumber,
  });

  writeMerchantState(input.merchantAddress, state);
  return {
    subscriptionId: subscription.id,
    billingCycleId: cycle.id,
    attemptId: attempt.id,
  };
}

export function registerSubscriptionApproval(
  input: RegisterSubscriptionApprovalInput
): RegisterSubscriptionApprovalResult {
  const state = readMerchantState(input.merchantAddress);
  const plan =
    input.planId && getPlanById(state, input.planId)
      ? (getPlanById(state, input.planId) as MerchantPlan)
      : ensurePlan(state, input.planName, input.periodSeconds, input.amountRef);
  const subscription = ensureSubscription(state, {
    customerCardAddress: input.customerCardAddress,
    customerSmartWallet: input.customerSmartWallet,
    plan,
    planRef: input.planRef || plan.planRef,
    subscriptionRef: input.subscriptionRef,
    amountRefMicros: input.amountRef,
    amountHandle: input.amountHandle,
  });

  const now = new Date();
  const timestamp = now.toISOString();
  const cycleEnd = new Date(now.getTime() + plan.billingIntervalSeconds * 1000).toISOString();

  subscription.planId = plan.id;
  subscription.planRef = input.planRef || plan.planRef || subscription.planRef;
  if (input.subscriptionRef) {
    subscription.subscriptionRef = input.subscriptionRef;
  }
  subscription.customerSmartWallet = input.customerSmartWallet || subscription.customerSmartWallet;
  if (subscription.status !== 'active' && subscription.status !== 'paused') {
    subscription.status = 'incomplete';
  }
  subscription.currentPeriodStart = timestamp;
  subscription.currentPeriodEnd = cycleEnd;
  subscription.nextChargeAt = cycleEnd;
  if (input.amountRef) {
    subscription.maxAllowanceRefMicros = input.amountRef;
  }
  if (input.amountHandle) {
    subscription.maxAllowanceHandle = input.amountHandle;
  }
  subscription.updatedAt = timestamp;

  const cycle = ensureCurrentCycle(state, subscription);

  appendEvent(state, 'subscription.approved_onchain', subscription.id, {
    amountRef: input.amountRef ?? null,
    billingCycleId: cycle.id,
    customerCardAddress: subscription.customerCardAddress,
  });

  writeMerchantState(input.merchantAddress, state);
  addMerchantToCustomerCardIndex(subscription.customerCardAddress, state.merchantAddress);
  return {
    subscriptionId: subscription.id,
    cycleId: cycle.id,
  };
}

export function getSubscriptionAgreementForCustomerCard(
  merchantAddress: string,
  customerCardAddress: string
) {
  const state = readMerchantState(merchantAddress);
  const normalizedCard = normalizeAddress(customerCardAddress).toLowerCase();

  const subscription = [...state.subscriptions]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .find((entry) => entry.customerCardAddress.toLowerCase() === normalizedCard);

  return subscription || null;
}

export function listMerchantsForCustomerCard(customerCardAddress: string) {
  const normalizedCard = normalizeAddress(customerCardAddress);
  if (typeof window === 'undefined') {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(customerCardIndexKey(normalizedCard));
    if (!raw) {
      return [] as string[];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [] as string[];
    }

    return parsed
      .filter((value) => typeof value === 'string' && isAddress(value))
      .map((value) => normalizeAddress(value));
  } catch {
    return [] as string[];
  }
}

export function finalizeBillingAttemptSuccess(input: FinalizeBillingAttemptSuccessInput) {
  const state = readMerchantState(input.merchantAddress);
  const attempt = state.attempts.find((entry) => entry.id === input.attemptId);

  if (!attempt) {
    return state;
  }

  attempt.userOpHash = input.userOpHash || attempt.userOpHash;
  attempt.txHash = input.txHash || attempt.txHash;

  finalizeSuccess(state, attempt, input.pulledAmountRef);
  writeMerchantState(input.merchantAddress, state);
  return state;
}

export function finalizeBillingAttemptFailure(input: FinalizeBillingAttemptFailureInput) {
  const state = readMerchantState(input.merchantAddress);
  const attempt = state.attempts.find((entry) => entry.id === input.attemptId);

  if (!attempt) {
    return state;
  }

  attempt.userOpHash = input.userOpHash || attempt.userOpHash;
  attempt.txHash = input.txHash || attempt.txHash;

  finalizeFailure(state, attempt, input.errorMessage);
  writeMerchantState(input.merchantAddress, state);
  return state;
}

export function retryBillingCycleNow(merchantAddress: string, cycleId: string) {
  const state = readMerchantState(merchantAddress);
  const cycle = state.cycles.find((entry) => entry.id === cycleId);
  if (!cycle) {
    return state;
  }

  cycle.status = 'open';
  cycle.nextAttemptAt = nowIso();
  cycle.updatedAt = nowIso();

  const subscription = state.subscriptions.find((entry) => entry.id === cycle.subscriptionId);
  if (subscription && subscription.status !== 'canceled') {
    subscription.status = 'past_due';
    subscription.updatedAt = nowIso();
  }

  appendEvent(state, 'billing_cycle.retry_requested', cycleId, {
    subscriptionId: cycle.subscriptionId,
  });
  writeMerchantState(merchantAddress, state);
  return state;
}

export function markBillingCycleUncollectible(merchantAddress: string, cycleId: string) {
  const state = readMerchantState(merchantAddress);
  const cycle = state.cycles.find((entry) => entry.id === cycleId);
  if (!cycle) {
    return state;
  }

  cycle.status = 'uncollectible';
  cycle.nextAttemptAt = undefined;
  cycle.updatedAt = nowIso();

  const subscription = state.subscriptions.find((entry) => entry.id === cycle.subscriptionId);
  if (subscription && subscription.status !== 'canceled') {
    subscription.status = 'unpaid';
    subscription.updatedAt = nowIso();
  }

  appendEvent(state, 'billing_cycle.marked_uncollectible', cycleId, {
    subscriptionId: cycle.subscriptionId,
  });
  writeMerchantState(merchantAddress, state);
  return state;
}

export function pauseSubscription(merchantAddress: string, subscriptionId: string) {
  const state = readMerchantState(merchantAddress);
  const subscription = state.subscriptions.find((entry) => entry.id === subscriptionId);
  if (!subscription || subscription.status === 'canceled') {
    return state;
  }

  subscription.status = 'paused';
  subscription.updatedAt = nowIso();
  appendEvent(state, 'subscription.paused', subscriptionId);
  writeMerchantState(merchantAddress, state);
  return state;
}

export function resumeSubscription(merchantAddress: string, subscriptionId: string) {
  const state = readMerchantState(merchantAddress);
  const subscription = state.subscriptions.find((entry) => entry.id === subscriptionId);
  if (!subscription || subscription.status === 'canceled') {
    return state;
  }

  subscription.status = 'active';
  subscription.updatedAt = nowIso();
  appendEvent(state, 'subscription.resumed', subscriptionId);
  writeMerchantState(merchantAddress, state);
  return state;
}

export function setSubscriptionCancelAtPeriodEnd(
  merchantAddress: string,
  subscriptionId: string,
  enabled: boolean
) {
  const state = readMerchantState(merchantAddress);
  const subscription = state.subscriptions.find((entry) => entry.id === subscriptionId);
  if (!subscription || subscription.status === 'canceled') {
    return state;
  }

  subscription.cancelAtPeriodEnd = enabled;
  subscription.updatedAt = nowIso();
  appendEvent(state, enabled ? 'subscription.cancel_scheduled' : 'subscription.cancel_unscheduled', subscriptionId);
  writeMerchantState(merchantAddress, state);
  return state;
}

export function updateSubscriptionAllowance(input: {
  merchantAddress: string;
  subscriptionId: string;
  amountRefMicros: string;
  amountHandle?: string;
}) {
  const state = readMerchantState(input.merchantAddress);
  const subscription = state.subscriptions.find((entry) => entry.id === input.subscriptionId);
  if (!subscription) {
    return state;
  }

  subscription.maxAllowanceRefMicros = input.amountRefMicros;
  if (input.amountHandle) {
    subscription.maxAllowanceHandle = input.amountHandle;
  }
  subscription.updatedAt = nowIso();
  appendEvent(state, 'subscription.allowance_updated', subscription.id, {
    amountRefMicros: input.amountRefMicros,
  });
  writeMerchantState(input.merchantAddress, state);
  return state;
}

export function cancelSubscription(merchantAddress: string, subscriptionId: string, atPeriodEnd: boolean) {
  const state = readMerchantState(merchantAddress);
  const subscription = state.subscriptions.find((entry) => entry.id === subscriptionId);
  if (!subscription) {
    return state;
  }

  subscription.cancelAtPeriodEnd = atPeriodEnd;
  if (atPeriodEnd) {
    subscription.updatedAt = nowIso();
    appendEvent(state, 'subscription.cancel_scheduled', subscriptionId);
  } else {
    subscription.status = 'canceled';
    subscription.canceledAt = nowIso();
    subscription.updatedAt = nowIso();
    appendEvent(state, 'subscription.canceled', subscriptionId);
  }
  writeMerchantState(merchantAddress, state);
  return state;
}

export function beginSettlement(input: BeginSettlementInput): BeginSettlementResult {
  const state = readMerchantState(input.merchantAddress);
  const settlement = {
    id: createId('set'),
    merchantAddress: state.merchantAddress,
    amountRef: input.amountRef,
    status: 'pending' as const,
    createdAt: nowIso(),
  };
  state.settlements.unshift(settlement);
  appendEvent(state, 'settlement.started', settlement.id, {
    amountRef: input.amountRef,
  });
  writeMerchantState(input.merchantAddress, state);

  return {
    settlementId: settlement.id,
  };
}

export function finalizeSettlementSuccess(input: {
  merchantAddress: string;
  settlementId: string;
  userOpHash?: string;
  txHash?: string;
}) {
  const state = readMerchantState(input.merchantAddress);
  const settlement = state.settlements.find((entry) => entry.id === input.settlementId);
  if (!settlement) {
    return state;
  }

  settlement.status = 'confirmed';
  settlement.userOpHash = input.userOpHash || settlement.userOpHash;
  settlement.txHash = input.txHash || settlement.txHash;
  settlement.resolvedAt = nowIso();
  appendEvent(state, 'settlement.confirmed', settlement.id);
  writeMerchantState(input.merchantAddress, state);
  return state;
}

export function finalizeSettlementFailure(input: {
  merchantAddress: string;
  settlementId: string;
  errorMessage: string;
  userOpHash?: string;
  txHash?: string;
}) {
  const state = readMerchantState(input.merchantAddress);
  const settlement = state.settlements.find((entry) => entry.id === input.settlementId);
  if (!settlement) {
    return state;
  }

  settlement.status = 'failed';
  settlement.userOpHash = input.userOpHash || settlement.userOpHash;
  settlement.txHash = input.txHash || settlement.txHash;
  settlement.failureReason = clampReason(input.errorMessage);
  settlement.resolvedAt = nowIso();
  appendEvent(state, 'settlement.failed', settlement.id);
  writeMerchantState(input.merchantAddress, state);
  return state;
}

function isSameDayUtc(date: Date, utcYear: number, utcMonth: number, utcDay: number) {
  return date.getUTCFullYear() === utcYear && date.getUTCMonth() === utcMonth && date.getUTCDate() === utcDay;
}

export function computeMerchantMetrics(state: MerchantControlPlaneState): MerchantMetrics {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  let failedToday = 0;
  let paidToday = 0;
  let mrrProxyMicros = 0n;

  const latestConfirmedBySubscription = new Map<string, BillingAttempt>();

  for (const attempt of state.attempts) {
    if (!attempt.resolvedAt) {
      continue;
    }
    const resolved = new Date(attempt.resolvedAt);
    if (Number.isNaN(resolved.getTime())) {
      continue;
    }

    if (attempt.status === 'failed' && isSameDayUtc(resolved, year, month, day)) {
      failedToday += 1;
    }
    if (attempt.status === 'confirmed' && isSameDayUtc(resolved, year, month, day)) {
      paidToday += 1;
    }

    if (attempt.status === 'confirmed') {
      const existing = latestConfirmedBySubscription.get(attempt.subscriptionId);
      if (!existing || existing.resolvedAt! < attempt.resolvedAt) {
        latestConfirmedBySubscription.set(attempt.subscriptionId, attempt);
      }
    }
  }

  for (const latest of latestConfirmedBySubscription.values()) {
    const ref = latest.pulledAmountRef || latest.requestedAmountRef;
    try {
      mrrProxyMicros += BigInt(ref);
    } catch {
      // Ignore malformed historical values.
    }
  }

  return {
    subscriptionsActive: state.subscriptions.filter((item) => item.status === 'active').length,
    subscriptionsPastDue: state.subscriptions.filter((item) => item.status === 'past_due').length,
    subscriptionsUnpaid: state.subscriptions.filter((item) => item.status === 'unpaid').length,
    subscriptionsPaused: state.subscriptions.filter((item) => item.status === 'paused').length,
    cyclesOpen: state.cycles.filter((item) => item.status === 'open').length,
    failedToday,
    paidToday,
    recoveryAtRisk: state.cycles.filter((item) => item.status === 'open' || item.status === 'uncollectible').length,
    mrrProxyMicros,
  };
}

export function buildRecoveryQueue(state: MerchantControlPlaneState): RecoveryQueueItem[] {
  const now = Date.now();
  const queue: RecoveryQueueItem[] = [];

  for (const cycle of state.cycles) {
    if (cycle.status !== 'open' && cycle.status !== 'uncollectible') {
      continue;
    }

    const subscription = state.subscriptions.find((entry) => entry.id === cycle.subscriptionId) || null;
    const latestAttempt = state.attempts
      .filter((entry) => entry.billingCycleId === cycle.id)
      .sort((left, right) => right.startedAt.localeCompare(left.startedAt))[0] || null;

    const ageHours = Math.max(0, (now - new Date(cycle.updatedAt).getTime()) / (60 * 60 * 1000));
    const classWeight =
      cycle.lastFailureClass === 'hard_failure'
        ? 90
        : cycle.lastFailureClass === 'requires_customer_action'
          ? 75
          : 60;

    const priorityScore = classWeight + cycle.attemptCount * 5 + Math.min(30, Math.floor(ageHours));
    queue.push({
      cycle,
      subscription,
      latestAttempt,
      priorityScore,
    });
  }

  return queue.sort((left, right) => right.priorityScore - left.priorityScore);
}

export function formatMicrosToCurrency(value: bigint | string, decimals = 6) {
  const raw = typeof value === 'bigint' ? value : BigInt(value || '0');
  const sign = raw < 0n ? '-' : '';
  const abs = raw < 0n ? -raw : raw;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const fraction = abs % base;
  const fractionText = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return fractionText.length > 0 ? `${sign}${whole.toString()}.${fractionText}` : `${sign}${whole.toString()}`;
}
