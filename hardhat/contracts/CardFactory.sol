// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "./PrivateCard.sol";



contract CardFactory is ZamaEthereumConfig {
    address public immutable cUSDC;

    event CardCreated(address indexed wallet, address card);

    mapping(address => address[]) public userToCards;

    constructor(address wrapper) {
        require(wrapper != address(0), "No cUSDC wrapper found");
        cUSDC = wrapper;
    }

    function createCard() external returns (address) {
        PrivateCard card = new PrivateCard(msg.sender, cUSDC);
        userToCards[msg.sender].push(address(card));
        emit CardCreated(msg.sender, address(card));
        return address(card);
    }

    function getCard(address wallet) external view returns (address) {
        address[] storage cards = userToCards[wallet];
        return cards.length > 0 ? cards[0] : address(0);
    }

    function getCards(address wallet) external view returns (address[] memory) {
        return userToCards[wallet];
    }
}
