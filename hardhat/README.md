# PayMe Smart Contracts

Solidity contracts for confidential subscription payments using Zama fhEVM and ERC-4337 account abstraction. Deployed on Sepolia testnet.

## Tech Stack

- **Solidity** — with `@fhevm/solidity` for homomorphic encryption operations
- **Hardhat** — compilation, testing, deployment
- **TypeScript** — test files and deployment scripts
- **Viem** — TypeScript client interactions
- **Zama fhEVM** — encrypted balances, encrypted inputs, ACL management

## Contract Inventory

### `PrivateCard.sol`

| Contract | Purpose |
|----------|---------|
| `PrivateCard.sol` | Core vault with encrypted cUSDC balance, subscription approvals, renewal pulls |
| `CardFactory.sol` | Deterministic factory for deploying user PrivateCard instances |
| `SubscriptionPlanRegistry.sol` | On-chain merchant plan records |
| `AccountRegistry.sol` | Smart wallet address resolution from passkey public key |
| `SimpleAccount.sol` | ERC-4337 smart account with WebAuthn signing |
| `SimpleAccountFactory.sol` | Factory for deterministic smart account deployment |
| `WebAuthn.sol` | P-256 signature verification for passkeys |
| `P256.sol` | secp256r1 curve operations |

### `lib/` — Library contracts

Shared helper contracts used across the protocol.

### `smart-wallet/` — Account Abstraction

ERC-4337 smart account implementation for passkey-based wallets.

| Contract | Purpose |
|----------|---------|
| `SimpleAccount.sol` | ERC-4337 smart account with WebAuthn signing |
| `SimpleAccountFactory.sol` | Deterministic factory for deploying smart accounts |
| `WebAuthn.sol` | P-256 signature verification for passkeys |
| `P256.sol` | secp256r1 curve operations |

### `mocks/` — Mock contracts

Test doubles for local development and unit testing.

## Project Structure

```
hardhat/
├── contracts/
│   ├── PrivateCard.sol         # Core vault with FHE subscription logic
│   ├── CardFactory.sol         # Deterministic card deployment
│   ├── SubscriptionPlanRegistry.sol  # Merchant plan registry
│   ├── AccountRegistry.sol     # Smart wallet resolution
│   ├── lib/                    # Shared libraries
│   ├── mocks/                  # Test mocks
│   └── smart-wallet/           # AA: SimpleAccount, WebAuthn, P256
├── deploy/
│   └── 002_deploy_card_factory.ts   # Deployment script
├── scripts/                    # Utility scripts
├── test/
│   ├── unit/                   # Unit tests
│   └── integration/            # Integration tests (AA + FHE flows)
├── tasks/                      # Hardhat custom tasks
└── hardhat.config.ts           # Hardhat configuration
```

## Environment

Create `hardhat/.env`:

```env
INFURA_API_KEY="YOUR_INFURA_KEY"
PRIVATE_KEY="YOUR_DEPLOYER_PRIVATE_KEY"
CUSDC_WRAPPER_ADDRESS="0x..."  # Sepolia cUSDC wrapper
```

## Commands

```bash
# Install
npm install

# Compile (ensure EVM version compatible with fhEVM precompiles)
npx hardhat compile

# Run tests
npm test

# Unit tests only
npx hardhat test test/unit/

# Integration tests
npx hardhat test test/integration/

# Deployment to Sepolia
npx hardhat run deploy/002_deploy_card_factory.ts --network sepolia

# Coverage
npx hardhat coverage
```

## Testing

Tests are organized into two levels:

- **Unit tests** (`test/unit/`) — individual contract behavior in isolation
- **Integration tests** (`test/integration/`) — end-to-end flows with AA bundling, using `@fhevm/hardhat-plugin` for encrypted handle simulation

fhEVM-heavy flows require the Hardhat fhEVM plugin. Integration tests verify:
- Card deployment via factory
- Subscription approval + first charge
- Renewal and retry flows
- ACL permission management

## Deployment Flow

1. Deploy `AccountRegistry`, `SubscriptionPlanRegistry`
2. Deploy `CardFactory` with references to both registries
3. Propagate deployed addresses to `frontend/.env.local`
4. Update ABI artifacts in frontend if contract interfaces change

## ABI Updates

After modifying contracts, update the frontend ABI:

1. Compile: `npx hardhat compile`
2. Copy `artifacts/contracts/PrivateCard.sol/PrivateCard.json` ABI into `frontend/src/config/constants.ts`
3. Verify frontend method signatures match contract changes
