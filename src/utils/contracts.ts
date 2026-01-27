// Contract addresses - Will be deployed to Polygon
export const CONTRACTS = {
  LIMITLESS_NFT:
    import.meta.env.VITE_NFT_ADDRESS ||
    "0x603223c1c3d8340E2aE77b681aA30Ef8b4A908DB",
  LIMITLESS_TOKEN:
    import.meta.env.VITE_TOKEN_ADDRESS ||
    "0x9052E962Fb16d3CF9D2BDE669ABA49e8C0c3769A",
  BUYBACK_POOL:
    import.meta.env.VITE_POOL_ADDRESS ||
    "0xE07fa79957741F46E4934cD9303234c9fB419d90",
  REFERRAL_MANAGER:
    import.meta.env.VITE_REFERRAL_ADDRESS ||
    "0x6a3CF5B8e5746efDBf4e6EC187e75dce1cB25001",
  LIMITLESS_REWARDS:
    import.meta.env.VITE_REWARDS_ADDRESS ||
    "0x8e54a8a2b7f94B1d1Cd7a5F64859d15612F42B30",
  STABLECOIN:
    import.meta.env.VITE_STABLECOIN_ADDRESS ||
    "0x09fcF239CC371c23DB47b5762B5A1E0266e08207",
  PANCAKE_ROUTER:
    import.meta.env.VITE_PANCAKE_ROUTER_ADDRESS ||
    "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PancakeSwap V2 Router
} as const;

// LimitlessNFT ABI - Main entry point for NFT purchases (JSON format for wagmi v2)
export const LIMITLESS_NFT_ABI = [
  // Read functions
  {
    type: "function",
    name: "nftPrice",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPricing",
    inputs: [],
    outputs: [
      { name: "_nftPrice", type: "uint256" },
      { name: "_commissionAmount", type: "uint256" },
      { name: "_buybackAmount", type: "uint256" },
      { name: "_rndAmount", type: "uint256" },
      { name: "_ceoAmount", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalMinted",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokensOfOwner",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenURI",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rndWallet",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCEOWallets",
    inputs: [],
    outputs: [{ type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  // Write functions
  {
    type: "function",
    name: "mint",
    inputs: [{ name: "referrer", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Events
  {
    type: "event",
    name: "NFTMinted",
    inputs: [
      { name: "buyer", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "referrer", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

// LimitlessToken ABI (JSON format for wagmi v2)
export const LIMITLESS_TOKEN_ABI = [
  // Read functions
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "circulatingSupply",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLockedSupply",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  // Write functions
  {
    type: "function",
    name: "burn",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
  // Events
  {
    type: "event",
    name: "TokensMinted",
    inputs: [
      { name: "to", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TokensBurned",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "redemptionValue", type: "uint256", indexed: false },
    ],
  },
] as const;

// BuybackPool ABI (JSON format for wagmi v2)
export const BUYBACK_POOL_ABI = [
  // Read functions
  {
    type: "function",
    name: "totalUsdtSpentOnBuyback",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalTokensBought",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalTokensRedeemed",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalUsdtReturned",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCurrentTokenPrice",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculateRedemption",
    inputs: [{ name: "tokenAmount", type: "uint256" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "minRedemptionAmount",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxSlippageBps",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPoolStats",
    inputs: [],
    outputs: [
      { name: "usdtSpent", type: "uint256" },
      { name: "tokensBought", type: "uint256" },
      { name: "tokensRedeemed", type: "uint256" },
      { name: "usdtReturned", type: "uint256" },
      { name: "poolBalance", type: "uint256" },
      { name: "tokenPrice", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getHistoryLength",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRecentSnapshots",
    inputs: [{ name: "count", type: "uint256" }],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "timestamp", type: "uint256" },
          { name: "totalBought", type: "uint256" },
          { name: "totalRedeemed", type: "uint256" },
          { name: "poolBalance", type: "uint256" },
          { name: "tokenPrice", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  // Write functions
  {
    type: "function",
    name: "redeemTokens",
    inputs: [{ name: "tokenAmount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Events
  {
    type: "event",
    name: "BuybackExecuted",
    inputs: [
      { name: "usdtAmount", type: "uint256", indexed: false },
      { name: "tokensReceived", type: "uint256", indexed: false },
      { name: "tokenPrice", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TokensRedeemed",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "tokensBurned", type: "uint256", indexed: false },
      { name: "usdtReceived", type: "uint256", indexed: false },
      { name: "tokenPrice", type: "uint256", indexed: false },
    ],
  },
] as const;

// ReferralManager ABI (JSON format for wagmi v2)
export const REFERRAL_MANAGER_ABI = [
  // Read functions
  {
    type: "function",
    name: "users",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "referrer", type: "address" },
      { name: "exists", type: "bool" },
      { name: "directReferrals", type: "uint256" },
      { name: "totalTeamSize", type: "uint256" },
      { name: "totalEarned", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isUserRegistered",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getReferralChain",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "address[6]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDirectReferrals",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTeamByLevels",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256[6]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserCommissions",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "recipient", type: "address" },
          { name: "buyer", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "level", type: "uint256" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCommissionCount",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "COMMISSION_LEVELS",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  // Events
  {
    type: "event",
    name: "CommissionPaid",
    inputs: [
      { name: "recipient", type: "address", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "level", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

// LimitlessRewards ABI (JSON format for wagmi v2)
export const LIMITLESS_REWARDS_ABI = [
  // Read functions
  {
    type: "function",
    name: "DAILY_REWARD_PER_NFT",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "userRewards",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "nftCount", type: "uint256" },
      { name: "lastClaimTime", type: "uint256" },
      { name: "totalClaimed", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculatePendingRewards",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserRewardInfo",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "nftCount", type: "uint256" },
      { name: "lastClaimTime", type: "uint256" },
      { name: "totalClaimed", type: "uint256" },
      { name: "pendingRewards", type: "uint256" },
      { name: "nextClaimTime", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDailyEarningRate",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTimeUntilNextClaim",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasClaimableRewards",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getGlobalStats",
    inputs: [],
    outputs: [
      { name: "totalNFTs", type: "uint256" },
      { name: "totalDistributed", type: "uint256" },
      { name: "dailyEmissionRate", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  // Write functions
  {
    type: "function",
    name: "claimRewards",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Events
  {
    type: "event",
    name: "RewardsClaimed",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "nftCount", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

// ERC20 ABI (for USDT/USDC) - Using JSON format for wagmi v2 compatibility
export const ERC20_ABI = [
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;
