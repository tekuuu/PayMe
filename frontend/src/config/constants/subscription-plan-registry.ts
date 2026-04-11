export const SUBSCRIPTION_PLAN_REGISTRY_ABI = [
  {
    inputs: [
      { internalType: "bytes32", name: "planRef", type: "bytes32" },
      { internalType: "uint64", name: "periodSeconds", type: "uint64" },
      { internalType: "uint256", name: "priceMicros", type: "uint256" },
      { internalType: "bytes32", name: "termsHash", type: "bytes32" },
    ],
    name: "createPlan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "planRef", type: "bytes32" }],
    name: "archivePlan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "planRef", type: "bytes32" }],
    name: "getPlan",
    outputs: [
      {
        components: [
          { internalType: "address", name: "merchant", type: "address" },
          { internalType: "uint64", name: "periodSeconds", type: "uint64" },
          { internalType: "uint256", name: "priceMicros", type: "uint256" },
          { internalType: "bytes32", name: "termsHash", type: "bytes32" },
          { internalType: "bool", name: "active", type: "bool" },
          { internalType: "uint64", name: "createdAt", type: "uint64" },
          { internalType: "uint64", name: "updatedAt", type: "uint64" },
        ],
        internalType: "struct SubscriptionPlanRegistry.PlanRecord",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "merchant", type: "address" }],
    name: "merchantPlanRefs",
    outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "planRef", type: "bytes32" },
      { internalType: "uint64", name: "periodSeconds", type: "uint64" },
      { internalType: "uint256", name: "priceMicros", type: "uint256" },
      { internalType: "bytes32", name: "termsHash", type: "bytes32" },
      { internalType: "bool", name: "active", type: "bool" },
    ],
    name: "updatePlan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

