export const CONTRACT_ADDRESS = "0x86f77ada675845b6e4C66870681c8c27bf6FFaF8";

export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "einput", name: "encryptedGuess", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
    ],
    name: "play",
    outputs: [{ internalType: "uint256", name: "gameId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "gameId", type: "uint256" }],
    name: "getHandles",
    outputs: [
      { internalType: "bytes32", name: "resultHandle", type: "bytes32" },
      { internalType: "bytes32", name: "userGuessHandle", type: "bytes32" },
      { internalType: "bytes32", name: "systemNumHandle", type: "bytes32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "gameId", type: "uint256" }],
    name: "getGame",
    outputs: [
      { internalType: "address", name: "player", type: "address" },
      { internalType: "bool", name: "isComplete", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "gameCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "gameId", type: "uint256" },
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "bytes32", name: "resultHandle", type: "bytes32" },
      { indexed: false, internalType: "bytes32", name: "userGuessHandle", type: "bytes32" },
      { indexed: false, internalType: "bytes32", name: "systemNumHandle", type: "bytes32" },
    ],
    name: "GamePlayed",
    type: "event",
  },
] as const;
