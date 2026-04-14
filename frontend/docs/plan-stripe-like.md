# Stripe-Inspired Merchant Experience Plan for PayMe

## 1. Goal

Design a Stripe-like merchant workspace for PayMe that is:

- operationally mature (state machine, retries, lifecycle),
- easy to run day-to-day (clear queues, statuses, actions),
- aligned with PayMe primitives (FHE + ERC-4337 + PrivateCard),
- intentionally not a visual clone, but a workflow-level adaptation.

This document is a planning artifact only. No code changes are included yet.

---

## 2. What We Learned from Stripe (Workflow, not Copy)

Stripe’s subscription model repeatedly emphasizes these patterns:

1. Subscriptions are managed as lifecycle state machines, not single button actions.
2. Invoices/cycles drive recurring collection and status transitions.
3. Failed payments are handled through retry policy + dunning + explicit terminal states.
4. Events/webhooks are the source of truth for state transitions.
5. Operators need dashboard-first tooling: filters, statuses, retries, pause/cancel, recovery queue.
6. Customer self-serve flows reduce support load (payment method updates, cancellation, invoice access).

Key Stripe references are listed in section 15.

---

## 3. PayMe Constraints and Opportunities

### Constraints we must keep

- On-chain execution engine remains:
  - `approveSubscription(merchant, encryptedMaxPerPeriod, periodSeconds)`
  - `pullSubscription(encryptedAmount)`
  - `unwrap(from, to, encryptedAmount)`
- Encrypted amounts are not visible to merchants by design.
- Business and personal account separation already exists and should remain.
- Existing merchant routes already in app:
  - `/merchant`
  - `/merchant/contracts`
  - `/merchant/customers`
  - `/merchant/billing`

### Opportunities

- Build a Stripe-like control plane off-chain around the existing on-chain calls.
- Add lifecycle records, retries, and operational queues without changing contract semantics.
- Improve merchant usability with a coherent information architecture and operator workflows.

---

## 4. Target Merchant Information Architecture

### 4.1 Navigation (new target)

1. `Overview` (`/merchant`)
2. `Subscriptions` (`/merchant/subscriptions`)
3. `Billing Cycles` (`/merchant/billing-cycles`)
4. `Customers` (`/merchant/customers`)
5. `Recovery` (`/merchant/recovery`)
6. `Payouts` (`/merchant/payouts`)
7. `Contract Controls` (`/merchant/contracts`)
8. `Integration` (`/merchant/integration`)

### 4.2 Keep vs Add

- Keep and refactor:
  - existing `contracts`, `customers`, `billing` pages.
- Add:
  - subscriptions list/detail,
  - billing cycle ledger,
  - recovery queue and retry policy page,
  - payouts-only workspace (split from billing),
  - integration page for embed + webhook health + API keys.

---

## 5. Customer-Side Workflow (PayMe adaptation of Stripe style)

1. Customer starts checkout embed (`/embed/checkout`) from merchant app.
2. Customer authorizes subscription max/period via passkey-signed userOp.
3. System creates `SubscriptionAgreement` in `incomplete` until first successful pull.
4. First successful pull marks agreement `active`.
5. Each renewal opens a billing cycle record and attempts on-chain `pullSubscription`.
6. Failures enter retry schedule (`past_due` semantics) until recovered or terminal.
7. Customer can manage subscription in future self-serve portal (phase 3+):
   - cancel now/end-of-period,
   - update limits/approval,
   - resume after pause when allowed by policy.

---

## 6. Merchant-Side Workflow (Operator playbook)

### Daily operations

1. Open `Overview` to monitor:
   - active subscriptions,
   - due today,
   - failed today,
   - recovery pipeline.
2. Run scheduled billing automatically (worker) with manual override from `Billing Cycles`.
3. Triage failures in `Recovery` queue:
   - retry now,
   - request customer action,
   - mark uncollectible per policy.
4. Use `Payouts` to unwrap settled cUSDC to USDC.
5. Use `Contract Controls` only for low-level troubleshooting or verification.

### Operator principles

- Every charge attempt must have a durable record.
- Every state transition must be explainable by event/receipt history.
- No hidden transitions based only on frontend assumptions.

---

## 7. Domain Model (Stripe-like, PayMe-native)

Add or persist these entities:

1. `MerchantPlan`
   - `id`, `merchantAddress`, `name`, `billingInterval`, `active`.
   - Optional public metadata only; no encrypted sensitive values.

2. `SubscriptionAgreement`
   - `id`, `merchantAddress`, `customerCardAddress`, `customerSmartWallet`, `planId`.
   - `status`: `trialing | incomplete | active | past_due | unpaid | paused | canceled | incomplete_expired`.
   - `currentPeriodStart`, `currentPeriodEnd`, `cancelAtPeriodEnd`, `canceledAt`.

3. `BillingCycle`
   - `id`, `subscriptionId`, `cycleStart`, `cycleEnd`.
   - `status`: `draft | open | paid | uncollectible | void`.
   - `attemptCount`, `nextAttemptAt`, `lastFailureClass`, `lastFailureReason`.

4. `BillingAttempt`
   - `id`, `billingCycleId`, `attemptNumber`.
   - `requestedAmountRef`, `pulledAmountRef` (reference/handle metadata, not decrypted value).
   - `userOpHash`, `txHash`, `status`, `startedAt`, `resolvedAt`.

5. `Settlement`
   - `id`, `merchantAddress`, `amountRef`, `userOpHash`, `txHash`, `status`.

6. `EventLedger`
   - append-only event stream for idempotent processing.
   - source: UI command, scheduler, receipt poller, on-chain event.

---

## 8. State Machine and Transition Rules

### Subscription states

- `incomplete`: authorization created but first successful pull not confirmed.
- `active`: latest cycle in good standing.
- `past_due`: cycle payment failed and retries remain.
- `unpaid`: retries exhausted or explicit unpaid policy selected.
- `paused`: collection intentionally paused.
- `canceled`: terminal (immediate or period-end).
- `incomplete_expired`: initial activation window missed.

### Billing cycle states

- `draft`: prepared but not attempted.
- `open`: collecting/retrying.
- `paid`: successful on-chain pull.
- `uncollectible`: exhausted by policy.
- `void`: manually canceled.

### Rules

1. Any successful attempt on latest cycle can recover subscription to `active`.
2. Retry exhaustion applies policy:
   - `unpaid` or `canceled` or remain `past_due` (configurable).
3. Cancellation at period end keeps service until period close, then terminal `canceled`.
4. Pause means no new attempt scheduling until resumed.

---

## 9. Failure Taxonomy and Recovery Policy

### Failure classes

1. `recoverable_transient`
   - bundler/RPC hiccup, temporary infra issue.
2. `requires_customer_action`
   - missing approval, insufficient encrypted allowance, expired/invalid customer authorization.
3. `hard_failure`
   - invalid card contract, policy block, deterministic revert that cannot auto-recover.

### Default retry policy (initial)

- Max attempts: 5.
- Schedule: +10m, +1h, +6h, +24h, +72h.
- After final failure:
  - default to `unpaid`,
  - allow merchant setting to switch to `canceled` or remain `past_due`.

### Operational outputs

- Recovery queue prioritized by:
  - ARR/MRR impact,
  - age in failure,
  - retry count remaining.

---

## 10. API Surface (Next API routes)

Add routes around existing on-chain calls:

1. `POST /api/merchant/subscriptions/create`
2. `GET /api/merchant/subscriptions`
3. `GET /api/merchant/subscriptions/:id`
4. `POST /api/merchant/subscriptions/:id/pause`
5. `POST /api/merchant/subscriptions/:id/resume`
6. `POST /api/merchant/subscriptions/:id/cancel`
7. `POST /api/merchant/billing-cycles/run`
8. `GET /api/merchant/billing-cycles`
9. `POST /api/merchant/billing-cycles/:id/retry`
10. `POST /api/merchant/billing-cycles/:id/mark-uncollectible`
11. `GET /api/merchant/recovery/queue`
12. `GET /api/merchant/recovery/policy`
13. `PUT /api/merchant/recovery/policy`
14. `POST /api/merchant/payouts/unwrap`
15. `GET /api/merchant/metrics/overview`

### Requirements

- idempotency key for write commands,
- durable command log,
- strict account-type and merchant-ownership checks.

---

## 11. Background Jobs and Reconciliation

Create background workers:

1. `billing_scheduler`
   - opens cycles due now and enqueues attempts.

2. `attempt_executor`
   - sends userOp for pull/unwrap and stores pending attempt record.

3. `receipt_reconciler`
   - polls userOp receipt, finalizes attempt outcome, emits domain event.

4. `retry_scheduler`
   - schedules next retry based on policy and failure class.

5. `stale_pending_resolver`
   - marks timed-out attempts for investigation and retry.

### Data safety

- all jobs idempotent,
- replay safe from `EventLedger`,
- no direct state mutation without event record.

---

## 12. UI/UX Redesign Spec (Stripe-inspired)

### 12.1 Overview (`/merchant`)

Purpose:
- command center for operator health.

Components:
- KPI row: `Active`, `Past due`, `MRR proxy`, `Recoverable at risk`.
- “Needs attention” table:
  - failed cycles,
  - expiring authorizations,
  - stalled payouts.
- quick actions:
  - `Run billing now`,
  - `Open recovery queue`,
  - `Create plan`.

### 12.2 Subscriptions (`/merchant/subscriptions`)

Purpose:
- canonical subscription ledger.

Components:
- dense table with filters:
  - status, plan, period, risk class.
- detail drawer/page:
  - timeline of events,
  - latest attempts,
  - next billing date,
  - manual actions (pause/resume/cancel/retry).

### 12.3 Billing Cycles (`/merchant/billing-cycles`)

Purpose:
- invoice-like cycle records and charge attempts.

Components:
- cycle list grouped by `draft/open/paid/uncollectible/void`.
- per-cycle attempt timeline with hashes and reasons.
- “retry now” and “mark uncollectible” actions.

### 12.4 Customers (`/merchant/customers`)

Purpose:
- customer account view, not just empty state.

Components:
- customer list with:
  - active subscription count,
  - risk state,
  - last successful payment date.
- profile view with:
  - cards linked,
  - agreements,
  - last failures,
  - recommended operator action.

### 12.5 Recovery (`/merchant/recovery`)

Purpose:
- Stripe-like dunning workspace.

Components:
- queue segmented by failure class.
- retry policy editor.
- customer contact/action state.
- recovery analytics:
  - recovered amount,
  - recovery rate,
  - median time to recovery.

### 12.6 Payouts (`/merchant/payouts`)

Purpose:
- separate settlement/unwrap from charge operations.

Components:
- available encrypted balance status,
- unwrap action panel,
- payout ledger with status/history.

### 12.7 Contract Controls (`/merchant/contracts`)

Purpose:
- low-level verification and diagnostics.

Components:
- existing verification view retained,
- add links back to customer/subscription records for context.

### 12.8 Integration (`/merchant/integration`)

Purpose:
- merchant SDK + embed + webhook readiness.

Components:
- embed URL builder,
- merchant key/address verification,
- webhook status and recent deliveries,
- “test checkout” sandbox trigger.

---

## 13. Implementation Phases

### Phase 0: Foundation (no behavior regression)

1. Define DB schema/entities from section 7.
2. Introduce `EventLedger` and idempotent command handling.
3. Add read-only merchant metrics endpoint.

Exit criteria:
- current flows still work,
- no UX change required yet.

### Phase 1: Observable Billing (minimum Stripe parity)

1. Persist `BillingCycle` and `BillingAttempt` for every charge attempt.
2. Build `Overview` and upgraded `Customers` with real data.
3. Add `Billing Cycles` page and manual retry action.

Exit criteria:
- operator can answer “what happened?” for any failed charge.

### Phase 2: Recovery Engine

1. Add retry policy and automated retry scheduler.
2. Add `Recovery` workspace and failure classification.
3. Add notifications/hooks for customer-action-required cases.

Exit criteria:
- failed payments recover automatically when possible.

### Phase 3: Full Merchant Control Plane

1. Add full `Subscriptions` management view.
2. Split `Payouts` from billing and add ledger.
3. Add `Integration` page and operational diagnostics.

Exit criteria:
- merchant section operates as full control center.

### Phase 4: Customer Self-Serve (optional but high ROI)

1. Add customer subscription management portal in PayMe context.
2. Add cancellation reasons + retention offers (if desired).
3. Close loop with subscription analytics.

---

## 14. Acceptance Criteria

1. Merchant can see every subscription and its lifecycle state.
2. Merchant can see every billing attempt and exact outcome.
3. Retry policy is configurable and enforced by worker.
4. Recovery queue is actionable with one-click operator actions.
5. Payout operations are tracked and auditable.
6. No change breaks current on-chain transaction correctness.
7. Personal/business guardrails remain enforced.

---

## 15. Source References Used

Stripe Dashboard itself requires authentication, so workflow analysis is based on Stripe public documentation:

1. https://docs.stripe.com/billing/subscriptions/overview
2. https://docs.stripe.com/billing/subscriptions/webhooks
3. https://docs.stripe.com/invoicing/integration/workflow-transitions
4. https://docs.stripe.com/billing/revenue-recovery/smart-retries
5. https://docs.stripe.com/billing/automatic-collection
6. https://docs.stripe.com/customer-management
7. https://docs.stripe.com/billing/subscriptions/integrating-customer-portal
8. https://docs.stripe.com/billing/subscriptions/change
9. https://docs.stripe.com/billing/subscriptions/cancel
10. https://docs.stripe.com/payments/subscriptions
11. https://docs.stripe.com/payments/advanced/build-subscriptions

---

## 16. Notes for Next Step (Implementation Planning)

When you review this plan, we can immediately convert it into:

1. route-by-route UI implementation tasks,
2. backend/API tickets,
3. event/job architecture tasks,
4. a safe execution order that delivers value each phase without breaking current flows.
