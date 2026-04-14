## Stripe-Like Subscription MVP (UI-First, Contract-Ready)

### Summary
Build the merchant and customer subscription experience around **general merchant plans** (monthly/yearly), then customer signups, then merchant visibility/control, without DB/workers yet.  
We will keep the current blockchain constraints in mind: subscription currency is **encrypted cUSDC**, card-side balance is decrypted on demand, and timing enforcement in smart contract is deferred until after UX is finalized.

### Implementation Changes
1. **Domain Model (frontend, source-of-truth abstraction)**
- Introduce `PlanTemplate` (merchant-defined): `id`, `merchantWallet`, `name`, `description`, `interval` (`monthly|yearly`), `amountCusdc`, `status` (`active|archived`), `checkoutSlug`, `createdAt`, `updatedAt`.
- Introduce `SubscriptionAgreement` (customer-specific): `id`, `planId`, `customerCard`, `status` (`active|cancel_at_period_end|canceled|past_due`), `currentPeriodStart`, `currentPeriodEnd`, `nextChargeAt`, `lastChargeAt`, `failureCount`, `maxAllowanceEncrypted`.
- Introduce `BillingAttempt`: `agreementId`, `scheduledAt`, `executedAt`, `result`, `txHash`, `reason`.
- Add `SubscriptionDataSource` interface with a **temporary in-app implementation** (no DB migration now), so DB-backed implementation can replace it later without UI rewrite.

2. **Merchant Portal (Stripe-like structure)**
- Merchant page becomes 3 primary surfaces:
- `Plans`: create/edit/archive plans, interval + amount config, generate shareable checkout link.
- `Subscribers`: customer agreements list grouped by plan, with status, next charge date, last payment, failure state.
- `Billing`: manual “Run due charges” action, dry-run preview, retry failed attempts.
- Remove customer-card fields from plan creation; customer card only appears in subscriber agreements.
- Add merchant cUSDC visibility panel with decrypt action using existing decrypt flow.

3. **Customer Subscription Flow**
- Add plan checkout page (`/subscribe/[checkoutSlug]`) showing plan details and cadence clearly.
- Customer selects card, confirms subscription, sets encrypted max allowance for the plan.
- Add “My Subscriptions” page: active plans, next charge date, cancel-at-period-end, resume, allowance update.
- Keep customer decrypted card balance visible through existing decryption mechanism.

4. **Billing Execution (Now vs Later)**
- **Now (implemented):** manual billing run only; system charges agreements where `nextChargeAt <= now` and status is chargeable.
- Add idempotency key per billing attempt to prevent duplicate charge submissions.
- Failure states surface actionable reasons in merchant UI (insufficient balance/allowance/tx failure).
- **Later (deferred by design):** replace manual trigger with backend scheduler + final smart-contract time guard.  
  UI and types will already carry period anchors (`currentPeriodEnd`, `nextChargeAt`) so contract checks can be plugged in later.

5. **Theme and UX Consistency for this feature set**
- Merchant/customer subscription pages use one consistent light-first default behavior aligned with current theme system.
- Status colors and state labels are standardized across merchant/customer pages (active, due, failed, canceled).

### Test Plan
- Merchant creates monthly and yearly plans; checkout links are generated and usable.
- Customer subscribes from checkout link; new agreement appears in merchant `Subscribers`.
- Manual billing run only charges due agreements and skips not-yet-due ones.
- Failed charge appears in billing attempts with retry path.
- Cancel-at-period-end keeps access until period end, then moves to canceled.
- Merchant and customer can decrypt and view cUSDC balances in relevant pages.
- Theme default and subscription status UI render consistently across Brave/Chrome and deployed app.

### Assumptions and Defaults
- Subscription token is encrypted cUSDC only for MVP.
- No DB schema/worker migration now; persistence layer is abstracted for future replacement.
- Smart-contract time-enforcement is intentionally deferred; current enforcement is application-side scheduling logic.
- Existing decrypt APIs/hooks remain the integration path for both customer card and merchant wallet balance views.
