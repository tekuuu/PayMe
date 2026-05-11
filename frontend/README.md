# PayMe Frontend

Next.js application for confidential subscription and payments using Zama fhEVM and ERC-4337 account abstraction.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript 5.7** (strict mode)
- **Tailwind CSS v4** + **shadcn/ui** (New York style)
- **viem** — Ethereum interaction, ABIs, typed data
- **Zama fhEVM SDK** — encrypted inputs, decrypt workflows, ACL management
- **ERC-4337 Bundler** — UserOperation submission via Pimlico
- **Drizzle ORM** + **PostgreSQL (Supabase)** — merchant control plane persistence

## Architecture

```
frontend/src/
├── app/
│   ├── api/                    # API routes
│   │   ├── fhe/sign-user-decrypt/    # Decrypt signature helper
│   │   ├── merchant/[address]/state/ # Read/write merchant state (plans, subs, cycles, attempts)
│   │   ├── customer/[address]/       # Activities + subscriptions per wallet
│   │   └── users/                    # User metadata and topup
│   ├── dashboard/              # Customer routes
│   │   ├── my-card/            # Card management, balances, shield/unshield
│   │   ├── subscriptions/      # View own subscriptions
│   │   └── activity/           # Activity log (from DB)
│   └── merchant/               # Merchant routes
│       ├── plans/              # Create/edit/archive plans
│       ├── subscriptions/      # View subscribers
│       ├── billing-cycles/     # Run dues, retry, uncollectible
│       ├── recovery/           # At-risk agreements
│       ├── reports/            # CSV export (compliance)
│       └── contracts/          # Contract controls
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── layout/                 # Sidebar, header, user-nav
│   ├── smart-wallet/           # Card, shield, send, receive components
│   └── merchant/               # Status badges, metric cards
├── hooks/
│   ├── use-private-card.ts     # Card lifecycle (create, link, resolve)
│   ├── use-merchant-control-plane.ts  # Merchant state with API + localStorage fallback
│   ├── use-confidential-balance.ts    # Decrypt via server signer
│   └── use-confidential-token-balance.ts  # Token-specific decrypt
├── lib/
│   ├── db/                     # Drizzle ORM schema + PostgreSQL client
│   │   ├── schema.ts           # Tables: merchant_plans, subscriptions, billing_cycles, billing_attempts, customer_activities
│   │   └── client.ts          # Pool connection via DATABASE_URL
│   ├── merchant/               # Business logic + control plane store
│   │   ├── control-plane-store.ts  # All state mutations, API dual-write
│   │   └── types.ts            # TypeScript types
│   └── smart-wallet/           # AA wallet abstraction layer
└── config/
    └── nav-config.ts           # Sidebar navigation items
```

## Database

All merchant operational state is persisted in PostgreSQL (Supabase) using Drizzle ORM. The schema includes five tables:

| Table | Purpose |
|-------|---------|
| `merchant_plans` | Plan templates (name, interval, amount, status) |
| `subscriptions` | Customer subscription agreements (card, status, period) |
| `billing_cycles` | Billing cycle records per subscription |
| `billing_attempts` | Attempt-level charge tracking |
| `customer_activities` | Activity log for shield/send/subscribe/unshield events |

Data flows: frontend → API routes → Drizzle → Supabase PostgreSQL. LocalStorage is retained as a migration-period fallback; reads go to API first.

### Schema Management

```bash
npm run db:generate   # Generate migration from schema changes
npm run db:push       # Push schema directly (dev)
npm run db:migrate    # Apply versioned migrations (production)
```

## Environment Variables

Copy `frontend/.env.example` to `frontend/.env.local`:

```env
# Network
NEXT_PUBLIC_RPC_ENDPOINT="https://sepolia.infura.io/v3/YOUR_KEY"
NEXT_PUBLIC_BUNDLER_URL="https://api.pimlico.io/v2/11155111/rpc?apikey=YOUR_KEY"

# Contracts
NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_PRIVATE_CARD_FACTORY_ADDRESS="0x..."
NEXT_PUBLIC_CUSDC_WRAPPER_ADDRESS="0x..."
NEXT_PUBLIC_REAL_USDC_ADDRESS="0x..."
NEXT_PUBLIC_SUBSCRIPTION_PLAN_REGISTRY_ADDRESS="0x..."
NEXT_PUBLIC_ACCOUNT_REGISTRY_ADDRESS="0x..."

# Relayer / Signer
RELAYER_PRIVATE_KEY="0x..."

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
```

## Getting Started

```bash
cd frontend
npm install
```

Configure `.env.local` with your environment (see above).

### Database Setup (Supabase)

1. Create a free Supabase project at https://supabase.com
2. Go to Settings → Database → Connection string → copy URI
3. Set `DATABASE_URL` in `.env.local`
4. Push the schema:

```bash
npm run db:push
```

### Development

```bash
npm run dev
```

The app starts at http://localhost:3000.

## Build

```bash
npm run build
```

For Vercel deployment, add `DATABASE_URL` as an environment variable in the project dashboard.

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/merchant/[address]/state` | GET | Fetch full merchant state (plans, subs, cycles, attempts) |
| `/api/merchant/[address]/state` | POST | Sync merchant state to database |
| `/api/customer/[address]/activities` | GET | Fetch customer activity log |
| `/api/customer/[address]/activities` | POST | Record new activity |
| `/api/customer/[address]/subscriptions` | GET | Fetch subscriptions by card address |
| `/api/fhe/sign-user-decrypt` | POST | Sign typed-data for decrypt workflow |

All merchant routes connect to PostgreSQL via the Drizzle ORM client. Customer routes serve data from the same database.

## Key Design Decisions

- **Server signer only**: Decrypt uses `RELAYER_PRIVATE_KEY`, never the browser wallet, preventing popup interruptions.
- **Dual-write migration**: State writes go to both API (async) and localStorage (sync). Reads prefer API. This allows gradual rollout without data loss.
- **Activity indexing**: Activities are recorded synchronously in the frontend and synced to the database. Future indexer service will watch on-chain events as canonical source.
- **Merchant control plane**: Plans, subscriptions, and billing cycles live in PostgreSQL, not localStorage. Cross-device and cross-browser consistency.
