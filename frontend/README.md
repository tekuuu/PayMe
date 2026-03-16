# PayMe Frontend

The frontend for the **PayMe** protocol is built with **Next.js 15**, **React**, and **Tailwind CSS**. It relies heavily on **Viem**, **Wagmi**, and the **zama/fhevm-sdk** to seamlessly interact with confidential states on-chain via an ERC-4337 Smart Wallet.

## 🛠️ Tech Stack & Key Libraries
- **Next.js & React 18**: Main frontend framework and UI logic.
- **Tailwind CSS & shadcn/ui**: For robust, modern styling and component architecture.
- **viem & wagmi**: Ethereum client management, ABIs, and local chain interop.
- **fhevm-sdk/react**: Front-end components managing FHE gateways, EIP-712 decryption signatures, and ciphertext preparation.
- **Pimlico**: Bundler and Paymaster APIs for submitting gas-abstracted Smart Wallet user operations.

## ⚙️ How It Works (The FHE + AA Flow)
1. **Passkey Onboarding:** The user connects or creates a passkey via WebAuthn API. No seed phrases are exposed. 
2. **Deterministic UI:** The frontend resolves the WebAuthn public key to its deterministic ERC-4337 smart wallet address (the `CardFactory` determines this).
3. **FHE Execution:** To view a balance, the frontend requests an ERC-712 signature from a specialized relayer-compatible signer, then leverages the FHE Network gateway to decrypt the on-chain handle locally. 
4. **Subscription / Sending:** If a user wishes to approve a subscription, the Next.js client uses `fhevm-sdk` to create an *Encrypted Input*, signs the payload with their passkey, and fires the transaction out through the bundler.

## 💻 Local Development Setup

Navigate into the `/frontend` directory and install the dependancies.

\`\`\`bash
npm install
\`\`\`

### Environment Variables
Copy `.env.example.txt` (or create an `.env.local` file) in the `frontend` root and fill out the deployment addresses:

\`\`\`env
# Infrastructure Providers
NEXT_PUBLIC_RPC_ENDPOINT="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
NEXT_PUBLIC_PIMLICO_BUNDLER_URL="https://api.pimlico.io/v2/11155111/rpc?apikey=YOUR_PIMLICO_KEY"

# Contracts
NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS="0x..." # Webauthn Account Factory address
NEXT_PUBLIC_PRIVATE_CARD_FACTORY_ADDRESS="0x..." # Deployed Card Factory
NEXT_PUBLIC_CUSDC_WRAPPER_ADDRESS="0x..." # The Zama cUSDC token
NEXT_PUBLIC_REAL_USDC_ADDRESS="0x..."

# Server Key for gasless paymasters or helper routes
RELAYER_PRIVATE_KEY="0x..."
\`\`\`

### Run the App

\`\`\`bash
npm run dev
\`\`\`

The app should now be running locally on [http://localhost:3000](http://localhost:3000). Enjoy confidential passkey execution!
