# Worker: Keeper Bot / Automation

## Objective

Build the automation layer that finds due subscriptions and submits renewal transactions.

## Ownership

- A new worker script or service for billing execution
- A minimal scheduler/cron entrypoint
- Read-only access to merchant subscription state

## Job

- Scan due subscriptions.
- For each due subscription:
  - build the renewal call
  - submit the transaction
  - record success or failure
- Retry failures according to a simple backoff policy.

## Prototype Rule

- Start with one renewal per tx.
- Do not require a human merchant to approve each renewal.
- Batch processing can be added later if time remains.

## Suggested Runtime Model

- Manual run button for local testing.
- Optional cron or polling loop for later.
- Idempotency key per subscription period.

## Required Outputs

- A worker command that can be run locally.
- Logging for:
  - due subscription discovered
  - tx submitted
  - tx confirmed
  - tx failed

## Done When

- The worker can process at least a small set of due subscriptions end to end.
- Failures are tracked per subscription.
- The worker does not depend on a merchant clicking each charge.

