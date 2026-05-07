# Worker: Frontend and Control Plane

## Objective

Update the frontend so the UI matches the new permissionless subscription model while keeping the prototype usable.

## Ownership

- `frontend/src/app/merchant/*`
- `frontend/src/app/dashboard/*` subscription surfaces
- `frontend/src/lib/merchant/control-plane-store.ts`
- `frontend/src/lib/subscriptions/data-source.ts`
- `frontend/src/app/embed/checkout/page.tsx`

## What to Change

- Keep checkout as the one-time customer authorization step.
- Make merchant billing surfaces reflect queued, due, and completed renewals.
- Ensure the local control plane still behaves like a ledger:
  - plans
  - subscriptions
  - billing cycles
  - attempts
  - retry state

## UI Rules

- The merchant should see renewal status per customer.
- The merchant should not be framed as manually signing each renewal.
- Show keeper-run status where possible.

## Data Model Rules

- Keep the current localStorage data source for the prototype.
- Keep the `SubscriptionDataSource` abstraction intact.
- Avoid hard-coding UI logic to localStorage so a DB can replace it later.

## Done When

- Merchant pages still work with the new contract flow.
- Checkout still creates an initial subscription approval.
- Billing pages show per-customer execution state clearly.

