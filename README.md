# PayMe 💳🔒

**PayMe** is a next-generation payments application that combines **Account Abstraction (ERC-4337)** and **Fully Homomorphic Encryption (FHE)** to deliver a seamless, gas-abstracted, and fully confidential decentralized finance experience.

Built utilizing **Zama's fhEVM**, PayMe allows users to create Passkey-secured Smart Wallets where all underlying balances, transfers, and recurring subscriptions are encrypted end-to-end on-chain.

## 🌟 Key Features

- **Confidential Balances & Transfers**: Built on top of confidential ERC-20 tokens (like `cUSDC`), ensuring your wallet balance and transaction sums are completely hidden from the public ledger.
- **Passkey Smart Wallets**: No seed phrases required. Biometric hardware (FaceID, TouchID, YubiKey) signs ERC-4337 UserOperations using native WebAuthn elliptic curve validation.
- **Private Virtual Cards**: Deploy individual smart contracts representing "Cards" that isolate allowances and scopes.
- **Encrypted Subscriptions**: Users can approve merchants with an *encrypted max spend* per period. Merchants can automatically pull funds up to that encrypted boundary without the network exposing what the maximum limit actually is.

## 🏗️ Architecture

PayMe is split into two primary components:

1. **[Frontend Applications (`/frontend`)](./frontend/README.md)**  
   A Next.js standard web application that manages the frontend UI, WebAuthn integration, fhEVM SDK instances for local encryption/decryption, and the AA bundler interactions (via Pimlico).

2. **[Smart Contracts (`/hardhat`)](./hardhat/README.md)**  
   A Hardhat workspace containing the fhEVM Solidty smart contracts, including the ERC-4337 Account Factory, the `PrivateCard` logic, and custom FHE token wrappers.

---

## 🚀 Quick Start Pipeline

To run the whole stack locally, you need to set up both environments.

### 1. Smart Contracts
Navigate to the hardhat environment to install dependencies, compile the FHE contracts, and deploy them:
\`\`\`bash
cd hardhat
npm install
npx hardhat compile
npx hardhat run deploy/002_deploy_card_factory.ts --network sepolia
\`\`\`
*(See the [Hardhat README](./hardhat/README.md) for environment variables requirements).*

### 2. Frontend
Navigate into the frontend to boot the Next.js client:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
*(Ensure you connect the frontend to the deployed contract addresses in your `.env.local`. See the [Frontend README](./frontend/README.md) for details).*

## 🔐 Security & Privacy Note (Hackathon Build)

This project leverages cutting-edge cryptographic technologies including the Zama `fhevm-sdk` and standard ERC-4337 architecture. It is designed as a working Proof-of-Concept for secure, private Web3 payments. Smart contracts have not undergone a full third-party security audit. 
