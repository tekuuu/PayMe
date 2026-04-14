// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ERC7984ERC20Wrapper} from "@openzeppelin/confidential-contracts/token/ERC7984/extensions/ERC7984ERC20Wrapper.sol";
import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";
import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract SepoliaUSDCWrapper is ERC7984ERC20Wrapper, ZamaEthereumConfig {
    event BalanceAclSynced(address indexed holder, address indexed grantee);

    constructor(IERC20 underlying_) 
        ERC7984("Confidential USDC", "cUSDC", "")
        ERC7984ERC20Wrapper(underlying_) 
    {}

    /// @notice Grants user-decrypt ACL for the caller's current balance handle to a chosen signer.
    /// @dev Must be called again after balance-changing operations because ERC7984 rotates handles.
    function syncBalanceAcl(address grantee) external {
        require(grantee != address(0), "Invalid grantee");

        euint64 balanceHandle = confidentialBalanceOf(msg.sender);
        require(FHE.isInitialized(balanceHandle), "Balance handle not initialized");

        FHE.allow(balanceHandle, grantee);
        FHE.allow(balanceHandle, msg.sender);
        FHE.allowThis(balanceHandle);

        emit BalanceAclSynced(msg.sender, grantee);
    }
}
