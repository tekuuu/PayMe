# Project Constitution: Private Card (Zama FHEVM)

**Version**: 1.0.0 | **Ratified**: 2026-03-02 | **Last Amended**: 2026-03-02
---

## Core Principles

- **Privacy First**: All card transaction data MUST be encrypted using Zama's FHEVM. No raw transaction amounts or recipient details should be visible on the public ledger.
- **Specification-Driven**: No implementation without a prior specification and technical plan.
- **User-Centric Security**: The user should have full control over their private data without compromising the utility of the card system.
- **Minimalist Design**: Favor simple, robust components over complex, multi-functional ones.

## Technical Standards

- **Core Protocol**: [Zama FHEVM](https://docs.zama.org/protocol) (v0.11.0+) and [Relayer SDK Guides](https://docs.zama.org/protocol/relayer-sdk-guides).
- **Solidity Version**: 0.8.27 (as defined in `hardhat.config.ts`).
- **Token Standards**: [OpenZeppelin Confidential Contracts](https://docs.openzeppelin.com/confidential-contracts/token) for fhERC20/Confidential Tokens.
- **Blockchain**: Zama FHEVM (fhevm.js/fhevm-hardhat for development).
- **Frontend**: Next.js, React, TailwindCSS.
- **Testing**: Every private operation must have a corresponding FHE-aware unit test and integration test using the latest FHEVM test environment.

## Development Workflow

1. **Specify**: Define the "what" in `specs/[feature]/spec.md`.
2. **Plan**: Define the "how" in `specs/[feature]/plan.md`.
3. **Execute**: Build the feature based on the approved plan.
4. **Verify**: Ensure the implementation matches the spec via automated and manual testing.
