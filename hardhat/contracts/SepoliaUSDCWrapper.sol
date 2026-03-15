// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ERC7984ERC20Wrapper} from "@openzeppelin/confidential-contracts/token/ERC7984/extensions/ERC7984ERC20Wrapper.sol";
import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract SepoliaUSDCWrapper is ERC7984ERC20Wrapper, ZamaEthereumConfig {
    constructor(IERC20 underlying_) 
        ERC7984("Confidential USDC", "cUSDC", "")
        ERC7984ERC20Wrapper(underlying_) 
    {}
}
