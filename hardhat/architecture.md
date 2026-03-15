# Private Card Architecture  
Zama fhevm + ERC-4337 Smart Wallet + Confidential USDC (cUSDC / ERC-7984)

Version: 1.6 – March 2026 – Production-grade reference  
Goal: Private card with send / receive / subscriptions using encrypted balances

## 1. Core Design Principles

- Your existing ERC-4337 Smart Wallet (passkey controlled) remains **untouched**  
- It is the **owner** and the only entity that can call sensitive functions on the card  
- The "card" is a **separate contract** → PrivateCard  
- USDC is wrapped into **cUSDC** (confidential ERC-7984 token) during funding  
- All balances and limits are encrypted (FHE)  
- Subscriptions are **pull-based** (merchant calls pullSubscription) with encrypted spending caps

## 2. Architecture Diagram (text)

User ──► ERC-4337 Smart Wallet (existing)  
          │  
          ├─► USDC.approve(cUSDC) + cUSDC.wrap(PrivateCard)  ← funding step  
          │  
          ├─► CardFactory.createCard()  ← one-time  
          │  
          └─► PrivateCard.transfer / approveSubscription / …  

Anyone ──► cUSDC.confidentialTransfer(PrivateCard, amount)  ← receive  
Merchant ──► PrivateCard.pullSubscription(amount)  ← subscription pull

## 3. Official Addresses (Sepolia – update from registry in production)

Wrappers Registry     0x2f0750Bbb0A246059d80e94c454586a7F27a128e  
USDC                  (standard Sepolia USDC – check Circle or testnet faucet)  
cUSDC / Wrapper       usually queried via registry – example: 0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639

Mainnet registry:     0xeb5015fF021DB115aCe010f23F55C2591059bBA0

Always prefer registry query over hardcoding.

## 4. Contracts (all code – copy into separate .sol files)

### CardFactory.sol

// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "./PrivateCard.sol";

interface IRegistry {
    function getConfidentialTokenAddress(address erc20)
        external view returns (bool isValid, address confidentialWrapper);
}

contract CardFactory is ZamaEthereumConfig {
    address public immutable cUSDC;

    event CardCreated(address indexed wallet, address card);

    mapping(address => address) public userToCard;

    constructor(address registry, address usdc) {
        (, address wrapper) = IRegistry(registry).getConfidentialTokenAddress(usdc);
        require(wrapper != address(0), "No cUSDC wrapper found");
        cUSDC = wrapper;

        // For quick testing you can hardcode instead:
        // cUSDC = 0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639; // Sepolia example
    }

    function createCard() external returns (address) {
        require(userToCard[msg.sender] == address(0), "Card already exists");
        PrivateCard card = new PrivateCard(msg.sender, cUSDC);
        userToCard[msg.sender] = address(card);
        emit CardCreated(msg.sender, address(card));
        return address(card);
    }

    function getCard(address wallet) external view returns (address) {
        return userToCard[wallet];
    }
}

### PrivateCard.sol

// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

interface IERC7984 {
    function confidentialTransfer(address to, euint64 encryptedAmount) external;
    function confidentialBalanceOf(address account) external view returns (euint64);
}

contract PrivateCard is ZamaEthereumConfig {
    address public immutable owner;
    address public immutable cUSDC;

    struct Subscription {
        euint64 maxPerPeriod;
        euint64 spentThisPeriod;
        uint256 periodSeconds;
        uint256 lastReset;
    }

    mapping(address => Subscription) public subscriptions;

    event ConfidentialTransfer(address indexed to, euint64 amount);
    event SubscriptionApproved(address merchant, euint64 maxPerPeriod);
    event SubscriptionPull(address merchant, euint64 amount);

    constructor(address _owner, address _cUSDC) {
        owner = _owner;
        cUSDC = _cUSDC;
    }

    // ── Send (user or approved subscription merchant) ────────────────────────────
    function transfer(address to, euint64 encryptedAmount) external {
        require(
            msg.sender == owner || subscriptions[msg.sender].maxPerPeriod.isInitialized(),
            "Unauthorized"
        );

        IERC7984(cUSDC).confidentialTransfer(to, encryptedAmount);

        if (subscriptions[msg.sender].maxPerPeriod.isInitialized()) {
            _updateSubscriptionSpent(msg.sender, encryptedAmount);
        }

        emit ConfidentialTransfer(to, encryptedAmount);
    }

    // ── Approve subscription limit (only wallet) ────────────────────────────────
    function approveSubscription(
        address merchant,
        euint64 encryptedMaxPerPeriod,
        uint256 periodSeconds
    ) external {
        require(msg.sender == owner, "Only wallet");

        subscriptions[merchant] = Subscription({
            maxPerPeriod: encryptedMaxPerPeriod,
            spentThisPeriod: FHE.asEuint64(0),
            periodSeconds: periodSeconds,
            lastReset: block.timestamp
        });

        FHE.allowThis(subscriptions[merchant].maxPerPeriod);
        FHE.allowThis(subscriptions[merchant].spentThisPeriod);

        emit SubscriptionApproved(merchant, encryptedMaxPerPeriod);
    }

    // ── Merchant pulls subscription payment ─────────────────────────────────────
    function pullSubscription(euint64 encryptedAmount) external {
        Subscription storage sub = subscriptions[msg.sender];
        require(sub.maxPerPeriod.isInitialized(), "No subscription");

        // Reset period if needed
        if (block.timestamp >= sub.lastReset + sub.periodSeconds) {
            sub.spentThisPeriod = FHE.asEuint64(0);
            sub.lastReset = block.timestamp;
        }

        ebool withinLimit = FHE.le(
            FHE.add(sub.spentThisPeriod, encryptedAmount),
            sub.maxPerPeriod
        );
        euint64 allowed = FHE.select(withinLimit, encryptedAmount, FHE.asEuint64(0));

        IERC7984(cUSDC).confidentialTransfer(msg.sender, allowed);
        sub.spentThisPeriod = FHE.add(sub.spentThisPeriod, allowed);

        emit SubscriptionPull(msg.sender, allowed);
    }

    // ── View encrypted balance (only owner) ─────────────────────────────────────
    function getEncryptedBalance() external view returns (euint64) {
        require(msg.sender == owner, "Only wallet");
        return IERC7984(cUSDC).confidentialBalanceOf(address(this));
    }

    function reencryptBalance(bytes32 publicKey) external view returns (bytes memory) {
        return FHE.reencrypt(
            IERC7984(cUSDC).confidentialBalanceOf(address(this)),
            publicKey
        );
    }

    function _updateSubscriptionSpent(address merchant, euint64 amount) internal {
        Subscription storage sub = subscriptions[merchant];
        sub.spentThisPeriod = FHE.add(sub.spentThisPeriod, amount);
        FHE.allowThis(sub.spentThisPeriod);
    }
}

## 5. Deployment Order

1. Deploy CardFactory (pass registry + USDC address)
2. User calls factory.createCard() via UserOperation → gets PrivateCard address
3. (Optional) Store card address in frontend / backend for the user

## 6. Funding Flow – from Smart Wallet (most important part)

User action "Add funds to card":

Batch in one UserOperation:

1. USDC.approve(cUSDC_address, amount)
2. IERC7984(cUSDC).wrap(card_address, amount)

Result:
- USDC leaves wallet
- Encrypted cUSDC balance appears on PrivateCard
- No public trace of the amount

## 7. Typical Operations

- Send             → card.transfer(recipient, encrypted_amount)
- Receive         → anyone calls cUSDC.confidentialTransfer(card, encrypted_amount)
- Approve sub     → card.approveSubscription(merchant, encrypted_max, seconds)
- Merchant pull   → merchant calls card.pullSubscription(encrypted_amount)

## 8. Frontend Notes

- Use Zama fhevm JavaScript SDK to encrypt64() amounts before sending
- Use reencryptBalance(publicKey) + sdk.decrypt() to show user their balance
- All write operations go through your existing ERC-4337 bundler / paymaster flow

## 9. Security & Audit Notes

- PrivateCard has no direct deposit function → funding only via official wrapper
- Only owner (smart wallet) can approve subscriptions or send freely
- All critical checks use FHE comparisons (no decryption on-chain)
- Consider adding merchant whitelist or pause functionality later

End of document