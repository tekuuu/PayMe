# Smart Wallet Funding Flows - Complete Reference

This document covers all mechanisms for funding, gas management, and balance handling in the PayMe smart wallet system.

---

## Complete Funding Flows Table

| # | Flow Name | Primary File(s) | Trigger | Steps | Key Constants / Config |
|---|-----------|-----------------|---------|-------|-----------------------|
| 1 | **Prefund Calculation** | `frontend/src/lib/smart-wallet/service/userOps/prefund.ts` | Before every `sendUserOperation()` | 1. Sum gas limits: `callGasLimit + verificationGasLimit + preVerificationGas`<br>2. Multiply by `maxFeePerGas` → `estimatedPrefundWei`<br>3. Add `additionalExecutionValueWei` (for ETH transfers)<br>4. Return required Wei as `bigint` | Formula: `(callGas + verifyGas + preGas) × maxFeePerGas` |
| 2 | **Ensure Prefund + Auto Top-Up** | `prefund.ts` → `frontend/src/app/api/users/topup/route.ts` | `ensureUserOpPrefund()` called before each UserOp submission | 1. Read smart wallet ETH balance + EntryPoint deposit balance (parallel via `Promise.all`)<br>2. Calculate `requiredFromWallet = requiredNativeBalanceWei - entryPointDeposit`<br>3. If `currentWalletBalance >= requiredFromWallet` → return `{ toppedUp: false }`<br>4. If insufficient → call `POST /api/users/topup` with `account` and `targetBalanceWei`<br>5. Returns top-up result with tx hash, amounts, and balances | Target default: **0.00009 ETH**<br>Fallback: if balance reads fail, continues with wallet-only targeting |
| 3 | **Server Relayer Top-Up API** | `frontend/src/app/api/users/topup/route.ts` | Called by Flow #2 when wallet balance is insufficient | 1. Validate `account` parameter<br>2. Check `RELAYER_PRIVATE_KEY` env var exists<br>3. Create viem wallet client from relayer private key<br>4. Read current wallet balance via `PUBLIC_CLIENT.getBalance()`<br>5. If `balanceBefore >= targetBalance` → return `{ toppedUp: false }`<br>6. Calculate `topUpAmount = targetBalance - balanceBefore`<br>7. Send native ETH transaction from relayer to smart wallet<br>8. **Wait for 1 confirmation** (120s timeout) — critical to avoid AA21 errors<br>9. Read `balanceAfter` and return full result | `RELAYER_PRIVATE_KEY` env var (required)<br>Default target: `parseEther("0.00009")` = 0.00009 ETH<br>Confirmation timeout: 120,000ms (2 min)<br>Confirmations required: 1 |
| 4 | **User Creation Funding** | `frontend/src/app/api/users/save/route.ts` | New user registration via factory | 1. Check if user already exists in factory via `getUser(id)`<br>2. If user exists: check balance; if below `MIN_BALANCE_WEI`, top-up to `TARGET_BALANCE_WEI`<br>3. If new user: call `saveUser()` on factory contract<br>4. Compute smart wallet address via `getAddress()`<br>5. Send `TARGET_BALANCE_WEI` (0.00009 ETH) from relayer to new wallet<br>6. Wait for both transactions to be mined before responding | `TARGET_BALANCE_WEI = 0.00009 ETH`<br>`MIN_BALANCE_WEI = 0.00009 ETH` |
| 5 | **EntryPoint Deposit Read** | `frontend/src/hooks/use-token-balances.ts` | Component mount (any balance display) | 1. Use wagmi `useReadContract` to call `ENTRYPOINT.balanceOf(account)`<br>2. Fallback query: `PUBLIC_CLIENT.getBalance()` with 15s refetch interval<br>3. Combine `walletBalance + depositBalance = totalBalance`<br>4. Return formatted balances for ETH, USDC, WETH | Refetch interval: 15s<br>Stale time: 30s |
| 6 | **Deposit Withdraw (Send Flow)** | `frontend/src/components/smart-wallet/send-token-card.tsx` | User sends ETH when wallet native balance < send amount | 1. Check if `walletEth < amountRaw && entryPointDeposit > 0n`<br>2. Calculate `neededFromDeposit = amountRaw - walletEth`<br>3. Prepend `ENTRYPOINT.withdrawTo(me.account, neededFromDeposit)` call to UserOp batch<br>4. Withdraws deposit back to wallet, making it spendable in same UserOp | Uses `ENTRYPOINT_WITHDRAW_ABI`<br>Function: `withdrawTo(address, uint256)` |
| 7 | **Gas Estimation + Buffering** | `frontend/src/lib/smart-wallet/service/userOps/builder.ts` | Every `buildUserOp()` call | 1. Resolve gas prices from 3 sources (priority order):<br>&nbsp;&nbsp;&nbsp;a. Bundler quote (`pimlico_getUserOperationGasPrice`)<br>&nbsp;&nbsp;&nbsp;b. Network `estimateFeesPerGas()`<br>&nbsp;&nbsp;&nbsp;c. `getGasPrice()` fallback<br>2. Apply 25% buffer (`bufferBps = 2500n`) to gas prices<br>3. Ensure minimums: `maxFeePerGas >= 2 gwei`, `maxPriorityFeePerGas >= 1 gwei`<br>4. Build partial UserOp with zero gas limits<br>5. Call `eth_estimateUserOperationGas` on bundler with 2000-byte dummy signature (WebAuthn overhead)<br>6. Apply aggressive margins on top of bundler estimates<br>7. If estimation fails → use hardcoded fallback values | New account floors (hasInitCode=true):<br>- `callGasLimit`: 500,000<br>- `verificationGasLimit`: 1,800,000<br>- `preVerificationGas`: 350,000<br><br>Existing account floors:<br>- `callGasLimit`: 350,000<br>- `verificationGasLimit`: 1,500,000<br>- `preVerificationGas`: 280,000<br><br>Gas buffer: 25% (2500 basis points) |
| 8 | **Operation-Specific Gas Floors** | `shield-card.tsx`, `shield.ts`, `unshield.ts`, `create-private-card.tsx` | Shield/unshield/card creation operations | Override builder estimates with hardcoded minimums per operation type. Applied via `withGasFloors()` helper function after `buildUserOp()`. | **Approve USDC**: 240k / 700k / 120k<br>**Wrap (shield)**: 800k / 1.6M / 220k<br>**Unwrap (unshield)**: 1.5M / 2.5M / 400k<br>**Finalize unwrap**: 400k / 700k / 120k<br>**Create Card (hardened)**: 400k / 1.1M / 170k<br>**Create Card (bumped)**: 500k / 1.4M / 190k<br><br>Format: callGasLimit / verificationGasLimit / preVerificationGas |
| 9 | **Balance Hooks** | `use-token-balances.ts`, `use-confidential-token-balance.ts` | Component render | 1. Read public balances: ETH (wallet + deposit), USDC, WETH<br>2. Read encrypted cUSDC handle from `CUSDC_WRAPPER.confidentialBalanceOf(callerAddress)`<br>3. Decrypt via server signer + `useFHEDecrypt()` from Zama relayer-sdk<br>4. Cache decrypted values in `runtimeDecryptedBalanceCache` (module-level Map)<br>5. Can perform ACL sync via `syncDecryptSignerAcl()` if using server signer | USDC address: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`<br>WETH address: `0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9`<br>cUSDC wrapper: from env or default `0x2F65250a9c0f038A40c2440c8A15526a2E568331` |
| 10 | **Relayer EOA Wallet (Funding Authority)** | `topup/route.ts`, `save/route.ts`, `sign-user-decrypt/route.ts` | All server-side funding and signing operations | 1. Holds `RELAYER_PRIVATE_KEY` environment variable<br>2. Sends ETH to smart wallets via top-up and save routes<br>3. Signs FHE decrypt EIP-712 payloads (`UserDecryptRequestVerification`)<br>4. Calls factory contract to register new users<br>5. Address: `0xcC5C64e2Ff52d9b2D95B5dc9d4B1e9Edf232693B` | Env var: `RELAYER_PRIVATE_KEY` (Hex format, required)<br>Relayer address: `0xcC5C64e2Ff52d9b2D95B5dc9d4B1e9Edf232693B` |
| 11 | **EntryPoint Contract Validation** | `hardhat/contracts/lib/account-abstraction/contracts/core/EntryPoint.sol`, `StakeManager.sol`, `BaseAccount.sol` | Bundler calls `handleOps()` on-chain | 1. `_getRequiredPrefund()`: Calculate `(callGas + verifyGas × multiplier + preGas) × maxFeePerGas`<br>2. `_validateAccountPrepayment()`: Create account if first time (`initCode` present)<br>3. Check `deposit >= requiredPrefund`<br>4. Revert `AA21` ("didn't pay prefund") if insufficient<br>5. Deduct prefund from deposit<br>6. `_handlePostOp()`: Refund unused gas after execution<br>7. `BaseAccount._payPrefund()`: Account sends missing ETH to EntryPoint if needed | Error codes:<br>- `AA21`: "didn't pay prefund"<br>- `AA22`: "expired or not due"<br>- `AA23`: "reverted (or OOG)"<br><br>Paymaster multiplier: 3x (with paymaster) or 1x (without) |
| 12 | **Error Decoding + Sanitization** | `frontend/src/lib/smart-wallet/revert-decode.ts`, `shield-card.tsx` | Any UserOp or transaction failure | 1. `describeExecutionRevertReason()`: Decode raw revert data by selector<br>2. `sanitizeErrorMessage()`: Map raw errors to user-friendly strings<br>3. Store both sanitized and raw error messages<br>4. Raw error shown in collapsible "View full error details" section | Revert selectors:<br>- `0xd0d25976` = `SenderNotAllowed(address)`<br>- `0x08c379a0` = `Error(string)`<br>- `0x67cfe805` = `TFHE.execute(...)`<br><br>AA errors → "prefund issue"<br>Timeout → "network timed out" |
| 13 | **Retry Mechanisms** | `builder.ts`, `use-private-card.ts`, `prefund.ts` | Gas estimation or UserOp failure | 1. Gas estimation fails → use hardcoded fallback values (1.3M / 1.8M / 650k)<br>2. Balance/deposit read fails → catch and continue with wallet-only targeting<br>3. Retryable gas error detected → retry with bumped values (+35-70% margins)<br>4. `isRetryableUserOpGasError()`: Detects AA40, AA23, verification gas overflow | Retryable errors: `AA40`, `AA23`, `over verificationgaslimit`, `preverificationgas is not enough`<br>Card retry bump: +35-70% gas values |

---

## Funding Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER ACTION (Frontend)                       │
│  e.g., Shield, Unshield, Send, Create Card                          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     UserOpBuilder.buildUserOp()                     │
│  - Resolve gas prices (bundler → network → fallback)               │
│  - Apply 25% buffer                                                 │
│  - Call eth_estimateUserOperationGas on bundler                    │
│  - Apply operation-specific gas floors                              │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   ensureUserOpPrefund()                             │
│  - Read wallet ETH balance + EntryPoint deposit (parallel)         │
│  - Calculate required prefund: (gas × maxFeePerGas) + value        │
│  - If wallet balance >= required → continue                        │
│  - If insufficient → call POST /api/users/topup                    │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              POST /api/users/topup (Server)                         │
│  - Load RELAYER_PRIVATE_KEY from env                               │
│  - Create relayer wallet client                                     │
│  - Send ETH from relayer → smart wallet                            │
│  - Wait for 1 confirmation (120s timeout)                          │
│  - Return result                                                    │
│                                                                      │
│  ⚠️ RELAYER MUST HAVE ENOUGH ETH TO FUND THIS TRANSFER             │
│  Current relayer: 0xcC5C64e2Ff52d9b2D95B5dc9d4B1e9Edf232693B      │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   smartWallet.sendUserOperation()                   │
│  - Sign UserOp with WebAuthn (fingerprint/face ID)                 │
│  - Send to bundler via eth_sendUserOperation                       │
│  - Bundler submits to EntryPoint.handleOps()                       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              EntryPoint Contract (On-Chain)                         │
│  - Validate UserOp (signature, nonce, gas)                         │
│  - Check deposit >= requiredPrefund                                │
│  - If insufficient → AA21 "didn't pay prefund" (REVERT)            │
│  - Deduct prefund from deposit                                      │
│  - Execute UserOp calls                                             │
│  - Refund unused gas after execution                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key File Locations

### Core Funding Logic
| File | Purpose |
|------|---------|
| `frontend/src/lib/smart-wallet/service/userOps/prefund.ts` | Prefund calculation + top-up orchestration |
| `frontend/src/app/api/users/topup/route.ts` | Server-side relayer top-up API endpoint |
| `frontend/src/app/api/users/save/route.ts` | User creation + initial funding |
| `frontend/src/lib/smart-wallet/service/userOps/builder.ts` | UserOp building + gas estimation |
| `frontend/src/lib/smart-wallet/service/userOps/constants.ts` | Gas floor defaults and UserOp defaults |

### Balance & Hooks
| File | Purpose |
|------|---------|
| `frontend/src/hooks/use-token-balances.ts` | Public token balances (ETH, USDC, WETH) + EntryPoint deposit |
| `frontend/src/hooks/use-confidential-token-balance.ts` | Encrypted cUSDC balance reading + decryption |

### UI Components Using Funding
| File | Purpose |
|------|---------|
| `frontend/src/components/smart-wallet/shield-card.tsx` | Shield/unshield with operation-specific gas floors |
| `frontend/src/components/smart-wallet/send-token-card.tsx` | Send with deposit withdrawal fallback |
| `frontend/src/components/smart-wallet/create-private-card.tsx` | Card creation with gas retry logic |

### Smart Contracts
| File | Purpose |
|------|---------|
| `hardhat/contracts/lib/account-abstraction/contracts/core/EntryPoint.sol` | AA EntryPoint - validates and executes UserOps |
| `hardhat/contracts/lib/account-abstraction/contracts/core/StakeManager.sol` | Deposit management, prefund deduction, refunds |
| `hardhat/contracts/lib/account-abstraction/contracts/core/BaseAccount.sol` | Base smart wallet implementation |

### Error Handling
| File | Purpose |
|------|---------|
| `frontend/src/lib/smart-wallet/revert-decode.ts` | Decode raw revert data by selector |
| `frontend/src/hooks/use-private-card.ts` | Gas error detection + retry logic |

---

## Current Issue: Relayer Underfunded

**Relayer Address**: `0xcC5C64e2Ff52d9b2D95B5dc9d4B1e9Edf232693B`  
**Network**: Sepolia  
**Current Balance**: ~0.000152 ETH  
**Required Per Top-Up**: ~0.001129 ETH  
**Recommended Funding**: At least **0.005 ETH** (covers ~4-5 top-ups)

**Error Symptoms**:
- "The total cost of executing this transaction exceeds the balance of the account"
- "insufficient funds for gas * price + value: have 152080566323143 want 1129339267724728"
- 500 Internal Server Error from `/api/users/topup`

**Fix**: Send Sepolia ETH to the relayer address using a Sepolia faucet or transfer from another account.

---

## Configuration Reference

### Environment Variables
| Variable | Location | Purpose |
|----------|----------|---------|
| `RELAYER_PRIVATE_KEY` | Server-only (not NEXT_PUBLIC) | Relayer EOA private key for funding + FHE signing |
| `NEXT_PUBLIC_RPC_ENDPOINT` | Client + Server | Sepolia RPC URL (Infura) |
| `NEXT_PUBLIC_ENTRYPOINT_ADDRESS` | Client + Server | EntryPoint v0.6 address |
| `NEXT_PUBLIC_BUNDLER_URL` | Client + Server | Bundler RPC (Pimlico) |
| `NEXT_PUBLIC_CUSDC_WRAPPER_ADDRESS` | Client + Server | cUSDC wrapper contract address |
| `NEXT_PUBLIC_REAL_USDC_ADDRESS` | Client + Server | Sepolia USDC token address |

### Gas Constants (from `constants.ts`)
| Constant | Value | Description |
|----------|-------|-------------|
| `DEFAULT_CALL_GAS_LIMIT` | 1,200,000 | Default call gas limit |
| `DEFAULT_VERIFICATION_GAS_LIMIT` | 1,200,000 | Default verification gas |
| `DEFAULT_PRE_VERIFICATION_GAS` | 120,000 | Default pre-verification gas |
| `DEFAULT_MAX_FEE_PER_GAS` | 2 gwei | Minimum max fee per gas |
| `DEFAULT_MAX_PRIORITY_FEE_PER_GAS` | 1 gwei | Minimum priority fee |

### Target Balance (from `topup/route.ts`)
| Constant | Value | Description |
|----------|-------|-------------|
| `TARGET_BALANCE_WEI` | 0.00009 ETH | Target balance for smart wallet prefund |
| `MIN_BALANCE_WEI` | 0.00009 ETH | Minimum balance before triggering top-up |
