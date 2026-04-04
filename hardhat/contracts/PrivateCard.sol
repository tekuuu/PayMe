// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, externalEuint64, euint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

interface IERC7984 {
    function confidentialTransfer(address to, euint64 encryptedAmount) external;
    function confidentialTransfer(address to, externalEuint64 encryptedAmount, bytes calldata inputProof) external;
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
    euint64 public mySyncedBalance;

    event ConfidentialTransfer(address indexed to, euint64 amount);
    event SubscriptionApproved(address merchant, euint64 maxPerPeriod);
    event SubscriptionPull(address merchant, euint64 amount);
    event BalanceAclSynced(address indexed grantee);

    constructor(address _owner, address _cUSDC) {
        owner = _owner;
        cUSDC = _cUSDC;
    }

    function _sendConfidential(address to, euint64 amount) internal {
        FHE.allowThis(amount);
        FHE.allowTransient(amount, address(cUSDC));
        IERC7984(cUSDC).confidentialTransfer(to, amount);
    }

    // ── Send (user or approved subscription merchant) ────────────────────────────
    function transfer(address to, euint64 encryptedAmount) external {
        require(
            msg.sender == owner || FHE.isInitialized(subscriptions[msg.sender].maxPerPeriod),
            "Unauthorized"
        );

        _sendConfidential(to, encryptedAmount);

        if (FHE.isInitialized(subscriptions[msg.sender].maxPerPeriod)) {
            _updateSubscriptionSpent(msg.sender, encryptedAmount);
        }

        _syncOwnerBalanceAcl();

        emit ConfidentialTransfer(to, encryptedAmount);
    }

    function transferWithProof(
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external {
        require(
            msg.sender == owner || FHE.isInitialized(subscriptions[msg.sender].maxPerPeriod),
            "Unauthorized"
        );

        euint64 decodedAmount = FHE.fromExternal(encryptedAmount, inputProof);
        _sendConfidential(to, decodedAmount);

        if (FHE.isInitialized(subscriptions[msg.sender].maxPerPeriod)) {
            _updateSubscriptionSpent(msg.sender, decodedAmount);
        }

        _syncOwnerBalanceAcl();

        emit ConfidentialTransfer(to, decodedAmount);
    }

    // ── Approve subscription limit (only wallet) ────────────────────────────────
    function approveSubscription(
        address merchant,
        uint256 encryptedMaxPerPeriod,
        uint256 periodSeconds
    ) external {
        require(msg.sender == owner, "Only wallet");

        euint64 val = euint64.wrap(bytes32(encryptedMaxPerPeriod));

        subscriptions[merchant] = Subscription({
            maxPerPeriod: val,
            spentThisPeriod: FHE.asEuint64(0),
            periodSeconds: periodSeconds,
            lastReset: block.timestamp
        });

        FHE.allowThis(subscriptions[merchant].maxPerPeriod);
        FHE.allowThis(subscriptions[merchant].spentThisPeriod);

        emit SubscriptionApproved(merchant, val);
    }

    // ── Merchant pulls subscription payment ─────────────────────────────────────
    function pullSubscription(euint64 encryptedAmount) external {
        Subscription storage sub = subscriptions[msg.sender];
        require(FHE.isInitialized(sub.maxPerPeriod), "No subscription");

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

        _sendConfidential(msg.sender, allowed);
        sub.spentThisPeriod = FHE.add(sub.spentThisPeriod, allowed);

        _syncOwnerBalanceAcl();

        emit SubscriptionPull(msg.sender, allowed);
    }

    /// @notice Sync ACL so the card owner can user-decrypt current card balance handle.
    function syncOwnerBalanceAcl() external {
        require(msg.sender == owner, "Only wallet");
        _syncOwnerBalanceAcl();
    }

    /// @notice Sync ACL for an additional decrypt signer address (for relayer-compatible ECDSA signing).
    function syncBalanceAcl(address grantee) external {
        require(msg.sender == owner, "Only wallet");
        require(grantee != address(0), "Invalid grantee");
        _syncBalanceAclFor(grantee);
    }

    // ── View encrypted balance (only owner) ─────────────────────────────────────
    function getEncryptedBalance() external view returns (euint64) {
        require(msg.sender == owner, "Only wallet");
        return mySyncedBalance;
    }



    function _updateSubscriptionSpent(address merchant, euint64 amount) internal {
        Subscription storage sub = subscriptions[merchant];
        sub.spentThisPeriod = FHE.add(sub.spentThisPeriod, amount);
        FHE.allowThis(sub.spentThisPeriod);
    }

    function _syncOwnerBalanceAcl() internal {
        _syncBalanceAclFor(owner);
    }

    function _syncBalanceAclFor(address grantee) internal {
        euint64 currentBalance = IERC7984(cUSDC).confidentialBalanceOf(address(this));
        if (FHE.isInitialized(currentBalance)) {
            mySyncedBalance = FHE.add(currentBalance, FHE.asEuint64(0));
        } else {
            mySyncedBalance = FHE.asEuint64(0);
        }
        FHE.allow(mySyncedBalance, grantee);
        FHE.allowThis(mySyncedBalance);
        emit BalanceAclSynced(grantee);
    }
}
