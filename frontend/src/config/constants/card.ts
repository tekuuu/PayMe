
export const CARD_FACTORY_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "registry",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "usdc",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ZamaProtocolUnsupported",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "wallet",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "card",
        "type": "address"
      }
    ],
    "name": "CardCreated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "cUSDC",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "confidentialProtocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "createCard",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "wallet",
        "type": "address"
      }
    ],
    "name": "getCard",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "wallet",
        "type": "address"
      }
    ],
    "name": "getCards",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userToCards",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
export const PRIVATE_CARD_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_cUSDC",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "ZamaProtocolUnsupported",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "grantee",
                "type": "address"
            }
        ],
        "name": "BalanceAclSynced",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "euint64",
                "name": "amount",
                "type": "bytes32"
            }
        ],
        "name": "ConfidentialTransfer",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "merchant",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "euint64",
                "name": "maxPerPeriod",
                "type": "bytes32"
            }
        ],
        "name": "SubscriptionApproved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "merchant",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "euint64",
                "name": "amount",
                "type": "bytes32"
            }
        ],
        "name": "SubscriptionPull",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "subscriptionRef",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "planRef",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "collector",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "euint64",
                "name": "maxPerPeriod",
                "type": "bytes32"
            }
        ],
        "name": "SubscriptionRefApproved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "subscriptionRef",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "planRef",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "collector",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "euint64",
                "name": "amount",
                "type": "bytes32"
            }
        ],
        "name": "SubscriptionRefPull",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "subscriptionRef",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "collector",
                "type": "address"
            }
        ],
        "name": "SubscriptionRefCanceled",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "merchant",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "encryptedMaxPerPeriod",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "periodSeconds",
                "type": "uint256"
            }
        ],
        "name": "approveSubscription",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "collector",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "planRef",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "subscriptionRef",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "encryptedMaxPerPeriod",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "periodSeconds",
                "type": "uint256"
            }
        ],
        "name": "approveSubscriptionRef",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "subscriptionRef",
                "type": "bytes32"
            }
        ],
        "name": "cancelSubscriptionRef",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "cUSDC",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "confidentialProtocolId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getEncryptedBalance",
        "outputs": [
            {
                "internalType": "euint64",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "mySyncedBalance",
        "outputs": [
            {
                "internalType": "euint64",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "merchantPlanToSubscriptionRef",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "merchant",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "planRef",
                "type": "bytes32"
            }
        ],
        "name": "getSubscriptionRefForMerchantPlan",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "subscriptionRef",
                "type": "bytes32"
            }
        ],
        "name": "getSubscriptionRefMeta",
        "outputs": [
            {
                "internalType": "address",
                "name": "collector",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "planRef",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "periodSeconds",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lastReset",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "euint64",
                "name": "encryptedAmount",
                "type": "bytes32"
            }
        ],
        "name": "pullSubscription",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "subscriptionRef",
                "type": "bytes32"
            },
            {
                "internalType": "euint64",
                "name": "encryptedAmount",
                "type": "bytes32"
            }
        ],
        "name": "pullSubscriptionRef",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "subscriptions",
        "outputs": [
            {
                "internalType": "euint64",
                "name": "maxPerPeriod",
                "type": "bytes32"
            },
            {
                "internalType": "euint64",
                "name": "spentThisPeriod",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "periodSeconds",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lastReset",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "grantee",
                "type": "address"
            }
        ],
        "name": "syncBalanceAcl",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "syncOwnerBalanceAcl",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "euint64",
                "name": "encryptedAmount",
                "type": "bytes32"
            }
        ],
        "name": "transfer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "externalEuint64",
                "name": "encryptedAmount",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "inputProof",
                "type": "bytes"
            }
        ],
        "name": "transferWithProof",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;
