# PayMe Testing Guide

This file contains the full, practical steps to test the project end-to-end.

## 1. Prerequisites

- Node.js 20+ and npm
- Sepolia RPC URL
- Deployer private key funded with Sepolia ETH
- Browser with Passkey support (Chrome recommended)

## 2. Install Dependencies

Run these commands from the repository root:

```bash
cd /home/zoe/Documents/zama/PayMe
cd hardhat && npm install
cd ../frontend && npm install
cd ../sdk && npm install
cd ../merchant-demo && npm install
```

## 3. Configure Environment Variables

### hardhat/.env
Add values required by your Hardhat config, typically:

```bash
SEPOLIA_RPC_URL=...
PRIVATE_KEY=...
```

### frontend/.env.local
Add all frontend-required values:

- Contract addresses (factory/card/wrapper)
- Relayer/bundler/paymaster values
- Any `NEXT_PUBLIC_*` values the app reads

### merchant-demo/.env.local

```bash
NEXT_PUBLIC_PAYME_APP_URL=http://localhost:3000
NEXT_PUBLIC_PAYME_MERCHANT_ADDRESS=0xYourMerchantAddress
```

## 4. Compile and Deploy Contracts

```bash
cd /home/zoe/Documents/zama/PayMe/hardhat
npx hardhat compile
npx hardhat run deploy/001_deploy_factory.ts --network sepolia
npx hardhat run deploy/002_deploy_card_factory.ts --network sepolia
npx hardhat run deploy/003_deploy_custom_wrapper.ts --network sepolia
```

Copy deployed addresses into `frontend/.env.local`.

## 5. Build SDK

```bash
cd /home/zoe/Documents/zama/PayMe/sdk
npm run build
```

## 6. Run Frontend and Merchant Demo

Use two terminals.

### Terminal A (PayMe frontend)

```bash
cd /home/zoe/Documents/zama/PayMe/frontend
npm run dev
```

### Terminal B (merchant-demo)

```bash
cd /home/zoe/Documents/zama/PayMe/merchant-demo
npm run dev -- -p 3001
```

Open:

- PayMe app: http://localhost:3000
- Merchant demo: http://localhost:3001

## 7. Frontend Functional Test Checklist

In PayMe frontend:

- Register/login with passkey
- Create/load smart wallet
- View balances
- Send token from smart wallet
- Confirm transaction hash appears
- Confirm balances update after transaction

If testing confidential balances:

- Run balance sync before decrypting
- Then decrypt refreshed handle

## 8. Merchant SDK Integration Checklist

In merchant-demo:

- Verify `PayMeElement` iframe loads
- Enter amount and click **Confirm Subscription**
- Verify status changes from idle to pending
- Verify success or error is returned to merchant page

## 9. Build Validation Commands

Use these for quick sanity checks:

```bash
cd /home/zoe/Documents/zama/PayMe/sdk && npm run build
cd /home/zoe/Documents/zama/PayMe/merchant-demo && npm run build
cd /home/zoe/Documents/zama/PayMe/frontend && npm run build
cd /home/zoe/Documents/zama/PayMe/hardhat && npx hardhat compile
```

## 10. Current Known Blocker

The SDK iframe expects a frontend route at:

- `/embed/checkout`

If that route is not implemented in the frontend, the merchant demo can mount the SDK but cannot complete full end-to-end checkout.

## 11. Expected Status Right Now

- SDK build: should pass
- merchant-demo build: should pass
- frontend build: should pass if env is valid
- hardhat compile: should pass
- Full merchant checkout completion: blocked until `/embed/checkout` + postMessage flow is implemented
