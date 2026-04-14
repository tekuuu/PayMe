// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

/// @title AccountRegistry
/// @notice On-chain source of truth for account roles.
/// @dev Bitmask roles:
/// - 1: personal
/// - 2: merchant/business
/// - 3: both
contract AccountRegistry {
    uint8 public constant ROLE_PERSONAL = 1;
    uint8 public constant ROLE_MERCHANT = 2;
    uint8 public constant ROLE_BOTH = 3;

    mapping(address => uint8) private _roles;

    event RoleSet(address indexed account, uint8 indexed role);

    error InvalidRole();
    error ZeroAddress();

    function setMyRole(uint8 role) external {
        _setRole(msg.sender, role);
    }

    function setMyRoles(uint8 roleMask) external {
        _setRole(msg.sender, roleMask);
    }

    function getRole(address account) external view returns (uint8) {
        return _roles[account];
    }

    function getRoles(address account) external view returns (uint8) {
        return _roles[account];
    }

    function hasRole(address account, uint8 roleMask) external view returns (bool) {
        return (_roles[account] & roleMask) == roleMask;
    }

    function _setRole(address account, uint8 roleMask) internal {
        if (account == address(0)) revert ZeroAddress();
        if (roleMask == 0 || roleMask > ROLE_BOTH) revert InvalidRole();

        _roles[account] = roleMask;
        emit RoleSet(account, roleMask);
    }
}
