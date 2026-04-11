// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title SubscriptionPlanRegistry
/// @notice Privacy-first plan registry:
/// - Stores only opaque identifiers and hashes on-chain.
/// - Human-readable merchant/plan details stay off-chain.
contract SubscriptionPlanRegistry is ZamaEthereumConfig {
    struct PlanRecord {
        address merchant;
        uint64 periodSeconds;
        uint256 priceMicros;
        bytes32 termsHash;
        bool active;
        uint64 createdAt;
        uint64 updatedAt;
    }

    mapping(bytes32 => PlanRecord) private _plans;
    mapping(address => bytes32[]) private _merchantPlanRefs;

    event PlanCreated(
        bytes32 indexed planRef,
        address indexed merchant,
        uint64 periodSeconds,
        uint256 priceMicros,
        bytes32 termsHash
    );
    event PlanUpdated(
        bytes32 indexed planRef,
        address indexed merchant,
        uint64 periodSeconds,
        uint256 priceMicros,
        bytes32 termsHash
    );
    event PlanArchived(bytes32 indexed planRef, address indexed merchant);

    error InvalidPlanRef();
    error PlanAlreadyExists();
    error PlanNotFound();
    error NotPlanMerchant();
    error InvalidPeriod();

    function createPlan(
        bytes32 planRef,
        uint64 periodSeconds,
        uint256 priceMicros,
        bytes32 termsHash
    ) external {
        if (planRef == bytes32(0)) revert InvalidPlanRef();
        if (periodSeconds == 0) revert InvalidPeriod();
        if (_plans[planRef].merchant != address(0)) revert PlanAlreadyExists();

        uint64 nowTs = uint64(block.timestamp);
        _plans[planRef] = PlanRecord({
            merchant: msg.sender,
            periodSeconds: periodSeconds,
            priceMicros: priceMicros,
            termsHash: termsHash,
            active: true,
            createdAt: nowTs,
            updatedAt: nowTs
        });
        _merchantPlanRefs[msg.sender].push(planRef);

        emit PlanCreated(planRef, msg.sender, periodSeconds, priceMicros, termsHash);
    }

    function updatePlan(
        bytes32 planRef,
        uint64 periodSeconds,
        uint256 priceMicros,
        bytes32 termsHash,
        bool active
    ) external {
        PlanRecord storage plan = _plans[planRef];
        if (plan.merchant == address(0)) revert PlanNotFound();
        if (plan.merchant != msg.sender) revert NotPlanMerchant();
        if (periodSeconds == 0) revert InvalidPeriod();

        plan.periodSeconds = periodSeconds;
        plan.priceMicros = priceMicros;
        plan.termsHash = termsHash;
        plan.active = active;
        plan.updatedAt = uint64(block.timestamp);

        emit PlanUpdated(planRef, msg.sender, periodSeconds, priceMicros, termsHash);
    }

    function archivePlan(bytes32 planRef) external {
        PlanRecord storage plan = _plans[planRef];
        if (plan.merchant == address(0)) revert PlanNotFound();
        if (plan.merchant != msg.sender) revert NotPlanMerchant();

        plan.active = false;
        plan.updatedAt = uint64(block.timestamp);

        emit PlanArchived(planRef, msg.sender);
    }

    function getPlan(bytes32 planRef) external view returns (PlanRecord memory) {
        return _plans[planRef];
    }

    function merchantPlanRefs(address merchant) external view returns (bytes32[] memory) {
        return _merchantPlanRefs[merchant];
    }
}

