// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "./PrivateCard.sol";



contract CardFactory is ZamaEthereumConfig {
    address public immutable cUSDC;

    event CardCreated(address indexed wallet, address card);

    mapping(address => address) public userToCard;

    constructor(address wrapper) {
        require(wrapper != address(0), "No cUSDC wrapper found");
        cUSDC = wrapper;
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
