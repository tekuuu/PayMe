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
cd /home/zoe/Documents/zama/PayMe/frontend
npm run build
```

## 6. Run Frontend

```bash
cd /home/zoe/Documents/zama/PayMe/frontend
npm run dev
```

Open the PayMe app at http://localhost:3000

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

## 8. Build Validation Commands

Use these for quick sanity checks:

```bash
cd /home/zoe/Documents/zama/PayMe/frontend && npm run build
cd /home/zoe/Documents/zama/PayMe/hardhat && npx hardhat compile
```

## 9. Current Known Blocker

If you need a third-party merchant integration surface later, the checkout embed route can still be wrapped by a thin SDK or iframe helper. It is not required for the contest prototype.

## 10. Expected Status Right Now

- frontend build: should pass if env is valid
- hardhat compile: should pass
- Full merchant checkout completion: should work through the main app's `/embed/checkout` flow
