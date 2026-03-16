# PayMe Smart Contracts (FHE + AA)

This directory contains the Solidity smart contracts powering the **PayMe** experience, heavily utilizing the **`@fhevm/solidity`** library for state encryption and mathematical calculation over ciphertexts.

## 🏗️ Contracts Overview

1. **`PrivateCard.sol`**: This is the core "Vault/Card" contract deployed for each user.
   - Holds an encrypted `cUSDC` balance securely.
   - Allows users to approve recurring Subscriptions using homomorphic conditionals.
   - Features `syncBalanceAcl()` utilizing Zama's `FHE.allow` mechanism to safely transfer ciphertext reading rights between the card itself, the owner, and the frontend decryption relayers.
2. **`CardFactory.sol`**: A lightweight deterministic factory enabling the frontend client to map deterministic user addresses to individual deployed `PrivateCard` contracts seamlessly.
3. **`CustomWrapper.sol`**: Confidential ERC-20 token scaffolding for local debugging, wrapping plain `USDC` into `cUSDC` (Confidential USDC).

## ⚙️ Development & Deployment

The contract suite is managed through the Hardhat framework configuration.

### Prerequisites

\`\`\`bash
npm install
\`\`\`

You must configure an `.env` file within the `/hardhat` directory:

\`\`\`env
# Infrastructure Providers
INFURA_API_KEY="YOUR_INFURA_KEY"
PRIVATE_KEY="YOUR_DEPLOYER_PRIVATE_KEY"

# Zama Setup
CUSDC_WRAPPER_ADDRESS="0x..." # Reference to fhEVM Confidential USDC wrapper
\`\`\`

### Compilation

Because `@fhevm/solidity` has specific EVM version compilation rules to support precompiles like `TFHE`, ensure you run compilation carefully:

\`\`\`bash
npx hardhat compile
\`\`\`

### Deployment

Deploy to the fhEVM Coprocessor network (or standard testnets using the Coprocessor):

\`\`\`bash
npx hardhat run deploy/002_deploy_card_factory.ts --network sepolia
\`\`\`

Once deployed, copy the new Factory address into the frontend `.env.local` as `NEXT_PUBLIC_PRIVATE_CARD_FACTORY_ADDRESS`.

### Updating the ABI
When you modify `PrivateCard.sol`, be sure to copy the `artifacts/contracts/PrivateCard.sol/PrivateCard.json` into the Next.js `constants` or use the deployment ABI sync script if configured.
