// Contract addresses - Update these after deployment
export const CONTRACTS = {
  LIMITLESS_NFT: import.meta.env.VITE_NFT_ADDRESS || "0x0000000000000000000000000000000000000000",
  LIMITLESS_TOKEN: import.meta.env.VITE_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
  LIQUIDITY_POOL: import.meta.env.VITE_POOL_ADDRESS || "0x0000000000000000000000000000000000000000",
  REFERRAL_MANAGER: import.meta.env.VITE_REFERRAL_ADDRESS || "0x0000000000000000000000000000000000000000",
  LIMITLESS_REWARDS: import.meta.env.VITE_REWARDS_ADDRESS || "0x0000000000000000000000000000000000000000",
  STABLECOIN: import.meta.env.VITE_STABLECOIN_ADDRESS || "0x0000000000000000000000000000000000000000",
} as const;

// LimitlessNFT ABI - Main entry point for NFT purchases
export const LIMITLESS_NFT_ABI = [
  // Read functions
  "function NFT_PRICE() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function totalMinted() view returns (uint256)",
  "function tokensOfOwner(address owner) view returns (uint256[])",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function rndWallet() view returns (address)",
  "function getCEOWallets() view returns (address[])",
  "function paused() view returns (bool)",
  // Write functions
  "function mint(address referrer) external",
  // Events
  "event NFTMinted(address indexed buyer, uint256 indexed tokenId, address indexed referrer, uint256 timestamp)",
] as const;

// LimitlessToken ABI
export const LIMITLESS_TOKEN_ABI = [
  // Read functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function circulatingSupply() view returns (uint256)",
  "function getLockedSupply() view returns (uint256)",
  "function paused() view returns (bool)",
  // Write functions
  "function burn(uint256 amount) external",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  // Events
  "event TokensMinted(address indexed to, uint256 amount)",
  "event TokensBurned(address indexed from, uint256 amount, uint256 redemptionValue)",
] as const;

// LiquidityPool ABI
export const LIQUIDITY_POOL_ABI = [
  // Read functions
  "function totalValueLocked() view returns (uint256)",
  "function totalRedeemed() view returns (uint256)",
  "function getCurrentTokenPrice() view returns (uint256)",
  "function calculateRedemption(uint256 tokenAmount) view returns (uint256)",
  "function minRedemptionAmount() view returns (uint256)",
  "function getPoolStats() view returns (uint256 tvl, uint256 redeemed, uint256 circulatingSupply, uint256 tokenPrice, uint256 poolBalance)",
  "function getHistoryLength() view returns (uint256)",
  "function getRecentSnapshots(uint256 count) view returns (tuple(uint256 timestamp, uint256 tvl, uint256 circulatingSupply, uint256 tokenPrice)[])",
  "function paused() view returns (bool)",
  // Write functions
  "function redeemTokens(uint256 tokenAmount) external",
  // Events
  "event TokensRedeemed(address indexed user, uint256 tokensBurned, uint256 usdReceived, uint256 tokenPrice)",
] as const;

// ReferralManager ABI
export const REFERRAL_MANAGER_ABI = [
  // Read functions
  "function users(address) view returns (address referrer, bool exists, uint256 directReferrals, uint256 totalTeamSize, uint256 totalEarned)",
  "function isUserRegistered(address user) view returns (bool)",
  "function getReferralChain(address user) view returns (address[6])",
  "function getDirectReferrals(address user) view returns (address[])",
  "function getTeamByLevels(address user) view returns (uint256[6])",
  "function getUserCommissions(address user) view returns (tuple(address recipient, address buyer, uint256 amount, uint256 level, uint256 timestamp)[])",
  "function getCommissionCount(address user) view returns (uint256)",
  "function COMMISSION_LEVELS(uint256 index) view returns (uint256)",
  // Events
  "event CommissionPaid(address indexed recipient, address indexed buyer, uint256 amount, uint256 level, uint256 timestamp)",
] as const;

// LimitlessRewards ABI
export const LIMITLESS_REWARDS_ABI = [
  // Read functions
  "function DAILY_REWARD_PER_NFT() view returns (uint256)",
  "function userRewards(address) view returns (uint256 nftCount, uint256 lastClaimTime, uint256 totalClaimed)",
  "function calculatePendingRewards(address user) view returns (uint256)",
  "function getUserRewardInfo(address user) view returns (uint256 nftCount, uint256 lastClaimTime, uint256 totalClaimed, uint256 pendingRewards, uint256 nextClaimTime)",
  "function getDailyEarningRate(address user) view returns (uint256)",
  "function getTimeUntilNextClaim(address user) view returns (uint256)",
  "function hasClaimableRewards(address user) view returns (bool)",
  "function getGlobalStats() view returns (uint256 totalNFTs, uint256 totalDistributed, uint256 dailyEmissionRate)",
  "function paused() view returns (bool)",
  // Write functions
  "function claimRewards() external",
  // Events
  "event RewardsClaimed(address indexed user, uint256 amount, uint256 nftCount, uint256 timestamp)",
] as const;

// ERC20 ABI (for USDT/USDC)
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
] as const;
