// Contract addresses - Deployed to BSC
export const CONTRACTS = {
  LIMITLESS_NFT:
    import.meta.env.VITE_NFT_ADDRESS ||
    "0x603223c1c3d8340E2aE77b681aA30Ef8b4A908DB",
  LIMITLESS_TOKEN:
    import.meta.env.VITE_TOKEN_ADDRESS ||
    "0x9052E962Fb16d3CF9D2BDE669ABA49e8C0c3769A",
  GENESIS_VAULT:
    import.meta.env.VITE_VAULT_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
  REFERRAL_MANAGER:
    import.meta.env.VITE_REFERRAL_ADDRESS ||
    "0x6a3CF5B8e5746efDBf4e6EC187e75dce1cB25001",
  STABLECOIN:
    import.meta.env.VITE_STABLECOIN_ADDRESS ||
    "0x09fcF239CC371c23DB47b5762B5A1E0266e08207",
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
      { name: "_vaultBackingAmount", type: "uint256" },
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
    name: "MAX_SUPPLY",
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

// GenesisVault ABI (JSON format for wagmi v2)
export const GENESIS_VAULT_ABI = [
  // View functions
  {
    type: "function",
    name: "getVaultStats",
    inputs: [],
    outputs: [
      { name: "backing", type: "uint256" },
      { name: "distributed", type: "uint256" },
      { name: "claimed", type: "uint256" },
      { name: "redeemed", type: "uint256" },
      { name: "redeemedUSDT", type: "uint256" },
      { name: "floorPrice", type: "uint256" },
      { name: "activeNFTs", type: "uint256" },
      { name: "vaultTokenBalance", type: "uint256" },
      { name: "dailyReward", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getFloorPrice",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculatePending",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getNFTInfo",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "tokenBalance", type: "uint256" },
      { name: "pendingTokens", type: "uint256" },
      { name: "totalEarned", type: "uint256" },
      { name: "totalClaimed", type: "uint256" },
      { name: "totalRedeemed", type: "uint256" },
      { name: "liquidityValue", type: "uint256" },
      { name: "isActive", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nftBalances",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "tokenBalance", type: "uint256" },
      { name: "totalEarned", type: "uint256" },
      { name: "totalClaimed", type: "uint256" },
      { name: "totalRedeemed", type: "uint256" },
      { name: "lastDistributionTime", type: "uint256" },
      { name: "registrationTime", type: "uint256" },
      { name: "isActive", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getNFTBalance",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getNFTLiquidityValue",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculateRedemption",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [{ type: "uint256" }],
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
          { name: "totalBacking", type: "uint256" },
          { name: "totalDistributed", type: "uint256" },
          { name: "floorPrice", type: "uint256" },
          { name: "activeNFTs", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalActiveNFTs",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalBackingUSDT",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalDistributedTokens",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "dailyRewardPerNFT",
    inputs: [],
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
  // Accrual-based system functions
  {
    type: "function",
    name: "getTotalAccruedTokens",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "userBonusBalance",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalBonusAwarded",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "sumOfRegistrationTimes",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserTotalAccrued",
    inputs: [
      { name: "user", type: "address" },
      { name: "tokenIds", type: "uint256[]" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBonusStats",
    inputs: [],
    outputs: [
      { name: "totalBonus", type: "uint256" },
      { name: "sumRegistrationTimes", type: "uint256" },
    ],
    stateMutability: "view",
  },
  // Write functions
  {
    type: "function",
    name: "distributeToNFT",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "batchDistribute",
    inputs: [{ name: "tokenIds", type: "uint256[]" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimTokens",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeemFromNFT",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeemFromWallet",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeemFromBonus",
    inputs: [{ name: "tokenAmount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Events
  {
    type: "event",
    name: "TokensDistributed",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TokensClaimed",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TokensRedeemedFromNFT",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "tokensBurned", type: "uint256", indexed: false },
      { name: "usdtReceived", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TokensRedeemedFromWallet",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "tokensBurned", type: "uint256", indexed: false },
      { name: "usdtReceived", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BackingAdded",
    inputs: [
      { name: "amount", type: "uint256", indexed: false },
      { name: "newTotal", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BonusTokensAwarded",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BonusTokensRedeemed",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "tokenAmount", type: "uint256", indexed: false },
      { name: "usdtReceived", type: "uint256", indexed: false },
      { name: "floorPrice", type: "uint256", indexed: false },
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

// ERC20 ABI (for USDC) - Using JSON format for wagmi v2 compatibility
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
