# Worker: Verification and Cleanup

## Objective

Prove the new billing model works and remove stale assumptions from docs and tests.

## Ownership

- `TESTING.md`
- `README.md`
- `hardhat/README.md`
- `frontend/README.md`
- Any smoke test or validation scripts

## Checklist

- Verify one-time customer approval works.
- Verify a keeper can execute a renewal.
- Verify renewal is blocked when not due.
- Verify cancel state blocks execution.
- Verify merchant and customer UIs still render.

## Docs to Fix

- Remove any claim that checkout is blocked if the route already exists.
- Update any text that implies a merchant human must sign every recurring renewal.
- Explain the keeper model in plain language.

## Done When

- The docs match the actual implementation.
- The manual test path is written down.
- The prototype can be demoed without ambiguity about who signs what.

