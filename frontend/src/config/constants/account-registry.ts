export const ACCOUNT_REGISTRY_ABI = [
  {
    inputs: [],
    name: "ROLE_PERSONAL",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ROLE_MERCHANT",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ROLE_BOTH",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "getRole",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "getRoles",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint8", name: "roleMask", type: "uint8" },
    ],
    name: "hasRole",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "role", type: "uint8" }],
    name: "setMyRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "roleMask", type: "uint8" }],
    name: "setMyRoles",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const ACCOUNT_ROLE_PERSONAL = 1;
export const ACCOUNT_ROLE_MERCHANT = 2;
export const ACCOUNT_ROLE_BOTH = 3;

