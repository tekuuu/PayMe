# Worker: Contract Redesign

## Objective

Redesign the subscription contract so renewals do not require a merchant human signature for every customer charge.

## Ownership

- `hardhat/contracts/PrivateCard.sol`
- `hardhat/contracts/SubscriptionPlanRegistry.sol` if the plan metadata needs new fields
- ABI exports in `frontend/src/config/constants/card.ts`
- Any deployment script that needs updated addresses or ABIs

## Current Problem

- `chargeSubscriptionRefRenewal()` currently requires `msg.sender == collector`.
- That makes renewal merchant-authorized and blocks a permissionless keeper model.

## Target Design

- A customer approves the subscription once.
- The contract stores a subscription mandate with:
  - `subscriptionRef`
  - `planRef`
  - merchant/collector address
  - period length
  - `paidThrough`
  - active / cancel state
- Renewal entrypoints should be callable by any executor.
- The contract must still pay the merchant and advance `paidThrough` atomically.

## Implementation Notes

- Remove the merchant-only caller check from the renewal path.
- Keep merchant recipient validation inside the stored subscription record.
- Enforce:
  - subscription is active
  - not cancel-at-period-end blocked
  - `block.timestamp >= paidThrough`
  - valid encrypted amount / allowance rules
- Emit clear events for:
  - subscription created
  - renewal charged
  - renewal failed or rejected

## Future-Friendly Extension

- If time allows, add a batch entrypoint for multiple subscription refs.
- If batching is too risky for the prototype, keep the contract single-charge and let the keeper batch off-chain.

## Done When

- A keeper can execute a renewal without needing a merchant passkey signature.
- A renewal still sends funds to the merchant.
- The contract rejects charges that are not yet due or are canceled.
- Frontend ABI constants are in sync.

