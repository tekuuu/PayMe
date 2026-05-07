# Subscription Redesign Plan

## Goal

Make PayMe subscription billing extendable in a few days of work without locking the project into a merchant-manual-signing model.

## Recommended Model

- Customer signs once during checkout to create the subscription mandate.
- The contract stores the merchant, subscription reference, period, next due time, and allowance.
- Any keeper bot can execute a due renewal.
- The contract enforces due-ness, status, and recipient correctness.
- The merchant does not need to sign every renewal.

## Why This Model

- It matches the on-chain subscription/keeper pattern better than human-per-charge signing.
- It is easier to scale than a merchant-click-per-user flow.
- It keeps the prototype realistic while remaining small enough to finish quickly.

## Scope Split

- `contract/worker.md` handles the on-chain redesign.
- `keeper/worker.md` handles the automation worker that scans and executes due charges.
- `frontend/worker.md` handles UI, control-plane, and flow updates.
- `verification/worker.md` handles test, docs, and end-to-end validation.

## Design Constraints

- Keep the first version simple.
- Prefer one renewal per user transaction in the first implementation.
- Add batching as a second step if time allows.
- Preserve the current local control-plane abstraction so a DB can replace it later.

