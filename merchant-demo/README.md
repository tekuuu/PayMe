# Merchant Demo

This app is a minimal merchant-side integration for `@payme/sdk`.

## What It Demonstrates

- Mounting `PayMeProvider` and `PayMeElement`
- Triggering `confirmSubscription()` from the merchant page
- Receiving status updates from the PayMe iframe flow

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_PAYME_APP_URL=http://localhost:3000
NEXT_PUBLIC_PAYME_MERCHANT_ADDRESS=0xYourMerchantAddress
```

Notes:

- `NEXT_PUBLIC_PAYME_APP_URL` must point to the running PayMe frontend host that serves `/embed/checkout`.
- `NEXT_PUBLIC_PAYME_MERCHANT_ADDRESS` should be your deployed merchant or card owner address.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
