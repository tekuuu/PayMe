# Activity Indexer Plan

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      BLOCKCHAIN                          │
│  ┌──────────┐ ┌───────────┐ ┌─────────┐ ┌───────────┐  │
│  │ Shield  │ │ Unshield │ │ Cards  │ │ Subs   │  │
│  │Contract│ │ Contract│ │Factory │ │Contract │  │
│  └────┬───┘ └────┬────┘ └───┬────┘ └───┬────┘  │
│       │          │         │         │         │        │
│    Tokens    │Tokens   │Card    │Subscription│
│    Shielded │Unshielde│Created │Created    │
└───────┼──────┼────────┼───────┼──────────┼────────────────┘
        │      │        │      │          │
        ▼      ▼        ▼      ▼          ▼
┌──────────────────────────────────────────────────────┐
│                   INDEXER SERVICE                    │
│  ┌─────────────────────────────────────────┐   │
│  │  Event Watcher (Poller / WebSocket)       │   │
│  │  - Fetch logs from RPC                  │   │
│  │  - Dedupe by tx_hash + event_index    │   │
│  │  - Parse event data                  │   │
│  └──────────────┬──────────────────────┘   │
│                 ▼                           │
│  ┌─────────────────────────────────────────┐   │
│  │  Activity Recorder                   │   │
│  │  - Transform to schema            │   │
│  │  - Store in PostgreSQL          │   │
│  └─────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│                 DATABASE (PostgreSQL)                  │
│                                                 │
│  activities table (source of truth)             │
└──────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│              GRAPHQL API (Hasura/Yoga)             │
│                                                 │
│  GET /graphql  (queries)                        │
│  POST /graphql (subscriptions via WS)            │
└──────────────────────────────────────────────┘
```

---

## Contracts & Events

### 1. Shield Contract (`0x...`)
```
Event: TokensShielded(
  minter: address,
  token: address, 
  amount: uint256
)

Activity mappings:
- type: SHIELD
- wallet_address: minter
- token_symbol: ERC20(token).symbol
- amount: amount
```

### 2. Unshield Contract (`0x...`)
```
Event: TokensUnshielded(
  binner: address,
  token: address,
  amount: uint256
)

Activity mappings:
- type: UNSHIELD
- wallet_address: binner
- token_symbol: ERC20(token).symbol
- amount: amount
```

### 3. Card Factory (`0x...`)
```
Event: CardCreated(
  creator: address,
  card: address
)

Event: CardLinked(
  card: address,
  linked: address
)

Event: CardUnlinked(
  card: address,
  unlinked: address
)
```

### 4. Subscriptions (`0x...`)
```
Event: SubscriptionCreated(
  customer: address,
  planId: uint256,
  periodDuration: uint256
)

Event: SubscriptionCancelled(
  customer: address,
  planId: uint256
)

Event: SubscriptionPaused(
  customer: address,
  planId: uint256
)

Event: SubscriptionResumed(
  customer: address,
  planId: uint256
)
```

---

## Database Schema

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- identification
  wallet_address VARCHAR(66) NOT NULL,
  card_address VARCHAR(66),
  type VARCHAR(30) NOT NULL, -- SHIELD, UNSHIELD, etc.
  
  -- token info
  token_symbol VARCHAR(10),
  amount NUMERIC(78, 0),
  
  -- blockchain info  
  tx_hash VARCHAR(66) UNIQUE NOT NULL,
  block_number BIGINT NOT NULL,
  event_index INTEGER NOT NULL,
  
  -- status
  status VARCHAR(20) DEFAULT 'confirmed',
  
  -- metadata
  metadata JSONB DEFAULT '{}',
  
  -- timestamps
  created_at TIMESTAMP NOT NULL,
  indexed_at TIMESTAMP DEFAULT NOW()
);

-- indexes
CREATE INDEX idx_activities_wallet ON activities(wallet_address, created_at DESC);
CREATE INDEX idx_activities_card ON activities(card_address, created_at DESC);
CREATE INDEX idx_activities_type ON activities(type, created_at DESC);
CREATE INDEX idx_activities_date ON activities(created_at DESC);
```

---

## Indexer Service

### File Structure
```
/indexer/
├── src/
│   ├── config.ts           # Contract addresses, RPC URL
│   ├── contracts/
│   │   └── abi.ts        # Event ABIs
│   ├── index.ts           # Main entry
│   ├── poller.ts         # Event polling logic
│   ├── parser.ts         # Parse event data
│   ├── db.ts            # PostgreSQL client
│   └── types.ts         # TypeScript types
├── package.json
└── .env
```

### Key Functions

```typescript
// poller.ts
async function pollBlockRange(fromBlock: number, toBlock: number) {
  const logs = await rpc.getLogs({
    address: [SHIELD_ADDR, UNSHIELD_ADDR, CARD_FACTORY_ADDR],
    fromBlock,
    toBlock,
  });
  
  for (const log of logs) {
    await processEvent(log);
  }
}

async function processEvent(log: Log) {
  const existing = await db.query(
    'SELECT 1 FROM activities WHERE tx_hash = $1 AND event_index = $2',
    [log.txHash, log.logIndex]
  );
  
  if (existing) return; // dedupe
  
  const activity = parseEventToActivity(log);
  await db.insert('activities', activity);
}
```

---

## GraphQL API

### Schema (Hasura-ready)

```graphql
type Activity {
  id: UUID!
  walletAddress: String! @column(name: "wallet_address")
  cardAddress: String @column(name: "card_address")
  type: ActivityType!
  tokenSymbol: String @column(name: "token_symbol")
  amount: BigInt
  txHash: String! @column(name: "tx_hash")
  status: ActivityStatus!
  createdAt: DateTime! @column(name: "created_at")
}

enum ActivityType {
  SHIELD
  UNSHIELD
  CARD_CREATED
  CARD_LINKED
  CARD_UNLINKED
  SUBSCRIBE
  SUBSCRIPTION_CANCELLED
  SUBSCRIPTION_PAUSED
  SUBSCRIPTION_RESUMED
  PAYMENT_RECEIVED
}

type Query {
  activities(
    walletAddress: String!
    cardAddress: String
    type: ActivityType
    limit: Int = 20
    offset: Int = 0
  ): [Activity!]!
  
  activity(txHash: String!): Activity
}
```

---

## Implementation Steps

### Phase 1: Database + Indexer
- [ ] Set up PostgreSQL (Supabase/Neon)
- [ ] Create activities table
- [ ] Build indexer service
- [ ] Test event parsing

### Phase 2: GraphQL
- [ ] Set up Hasura or GraphQL Yoga
- [ ] Add activity queries
- [ ] Connect to indexer DB

### Phase 3: Frontend Integration
- [ ] Update frontend to call GraphQL
- [ ] Add fallback to localStorage
- [ ] Show sync status

### Phase 4: Full Migration
- [ ] Decommission localStorage writes
- [ ] Use indexer as sole source
- [ ] Add real-time subscriptions

---

## Contract Addresses (to fill in)

| Contract | Sepolia | Mainnet |
|----------|--------|--------|
| Shield | `0x...` | `0x...` |
| Unshield | `0x...` | `0x...` |
| CardFactory | `0x...` | `0x...` |
| Subscriptions | `0x...` | `0x...` |

---

## Notes

- Use RPC with archive node for historical logs
- Index from deployment block onward
- Hasura provides instant GraphQL + subscriptions
- Run indexer as cron job (every 1-5 min)