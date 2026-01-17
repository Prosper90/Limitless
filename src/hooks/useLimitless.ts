import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import {
  CONTRACTS,
  LIMITLESS_NFT_ABI,
  LIMITLESS_TOKEN_ABI,
  LIQUIDITY_POOL_ABI,
  REFERRAL_MANAGER_ABI,
  LIMITLESS_REWARDS_ABI,
  ERC20_ABI
} from "../utils/contracts";

// Hook for NFT operations
export function useLimitlessNFT() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: nftPrice } = useReadContract({
    address: CONTRACTS.LIMITLESS_NFT as `0x${string}`,
    abi: LIMITLESS_NFT_ABI,
    functionName: "NFT_PRICE",
  });

  const { data: totalMinted } = useReadContract({
    address: CONTRACTS.LIMITLESS_NFT as `0x${string}`,
    abi: LIMITLESS_NFT_ABI,
    functionName: "totalMinted",
  });

  const { data: userNFTBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.LIMITLESS_NFT as `0x${string}`,
    abi: LIMITLESS_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: userTokens, refetch: refetchTokens } = useReadContract({
    address: CONTRACTS.LIMITLESS_NFT as `0x${string}`,
    abi: LIMITLESS_NFT_ABI,
    functionName: "tokensOfOwner",
    args: address ? [address] : undefined,
  });

  const mintNFT = async (referrer: string = "0x0000000000000000000000000000000000000000") => {
    writeContract({
      address: CONTRACTS.LIMITLESS_NFT as `0x${string}`,
      abi: LIMITLESS_NFT_ABI,
      functionName: "mint",
      args: [referrer as `0x${string}`],
    });
  };

  return {
    nftPrice: nftPrice ? formatEther(nftPrice as bigint) : "100",
    totalMinted: totalMinted?.toString() || "0",
    userNFTBalance: userNFTBalance?.toString() || "0",
    userTokens: userTokens as bigint[] | undefined,
    mintNFT,
    isPending,
    isConfirming,
    isSuccess,
    error,
    refetchBalance,
    refetchTokens,
  };
}

// Hook for Token operations
export function useLimitlessToken() {
  const { address } = useAccount();

  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.LIMITLESS_TOKEN as `0x${string}`,
    abi: LIMITLESS_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: circulatingSupply } = useReadContract({
    address: CONTRACTS.LIMITLESS_TOKEN as `0x${string}`,
    abi: LIMITLESS_TOKEN_ABI,
    functionName: "circulatingSupply",
  });

  const { data: lockedSupply } = useReadContract({
    address: CONTRACTS.LIMITLESS_TOKEN as `0x${string}`,
    abi: LIMITLESS_TOKEN_ABI,
    functionName: "getLockedSupply",
  });

  const { data: totalSupply } = useReadContract({
    address: CONTRACTS.LIMITLESS_TOKEN as `0x${string}`,
    abi: LIMITLESS_TOKEN_ABI,
    functionName: "totalSupply",
  });

  return {
    tokenBalance: tokenBalance ? formatEther(tokenBalance as bigint) : "0",
    circulatingSupply: circulatingSupply ? formatEther(circulatingSupply as bigint) : "0",
    lockedSupply: lockedSupply ? formatEther(lockedSupply as bigint) : "0",
    totalSupply: totalSupply ? formatEther(totalSupply as bigint) : "0",
    refetchBalance,
  };
}

// Hook for Liquidity Pool operations
export function useLiquidityPool() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: poolStats, refetch: refetchStats } = useReadContract({
    address: CONTRACTS.LIQUIDITY_POOL as `0x${string}`,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "getPoolStats",
  });

  const { data: tokenPrice } = useReadContract({
    address: CONTRACTS.LIQUIDITY_POOL as `0x${string}`,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "getCurrentTokenPrice",
  });

  const { data: minRedemption } = useReadContract({
    address: CONTRACTS.LIQUIDITY_POOL as `0x${string}`,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "minRedemptionAmount",
  });

  const calculateRedemption = async (amount: string) => {
    const amountWei = parseEther(amount);
    // This is a view function, would need to be called separately
    return "0";
  };

  const redeemTokens = async (amount: string) => {
    const amountWei = parseEther(amount);
    writeContract({
      address: CONTRACTS.LIQUIDITY_POOL as `0x${string}`,
      abi: LIQUIDITY_POOL_ABI,
      functionName: "redeemTokens",
      args: [amountWei],
    });
  };

  const stats = poolStats as [bigint, bigint, bigint, bigint, bigint] | undefined;

  return {
    tvl: stats ? formatEther(stats[0]) : "0",
    totalRedeemed: stats ? formatEther(stats[1]) : "0",
    circulatingSupply: stats ? formatEther(stats[2]) : "0",
    tokenPrice: tokenPrice ? formatEther(tokenPrice as bigint) : "0",
    poolBalance: stats ? formatEther(stats[4]) : "0",
    minRedemption: minRedemption ? formatEther(minRedemption as bigint) : "1",
    redeemTokens,
    isPending,
    isConfirming,
    isSuccess,
    error,
    refetchStats,
  };
}

// Hook for Rewards operations
export function useLimitlessRewards() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: rewardInfo, refetch: refetchRewards } = useReadContract({
    address: CONTRACTS.LIMITLESS_REWARDS as `0x${string}`,
    abi: LIMITLESS_REWARDS_ABI,
    functionName: "getUserRewardInfo",
    args: address ? [address] : undefined,
  });

  const { data: hasClaimable } = useReadContract({
    address: CONTRACTS.LIMITLESS_REWARDS as `0x${string}`,
    abi: LIMITLESS_REWARDS_ABI,
    functionName: "hasClaimableRewards",
    args: address ? [address] : undefined,
  });

  const { data: globalStats } = useReadContract({
    address: CONTRACTS.LIMITLESS_REWARDS as `0x${string}`,
    abi: LIMITLESS_REWARDS_ABI,
    functionName: "getGlobalStats",
  });

  const claimRewards = async () => {
    writeContract({
      address: CONTRACTS.LIMITLESS_REWARDS as `0x${string}`,
      abi: LIMITLESS_REWARDS_ABI,
      functionName: "claimRewards",
    });
  };

  const info = rewardInfo as [bigint, bigint, bigint, bigint, bigint] | undefined;
  const global = globalStats as [bigint, bigint, bigint] | undefined;

  return {
    nftCount: info ? info[0].toString() : "0",
    lastClaimTime: info ? new Date(Number(info[1]) * 1000) : null,
    totalClaimed: info ? formatEther(info[2]) : "0",
    pendingRewards: info ? formatEther(info[3]) : "0",
    nextClaimTime: info ? new Date(Number(info[4]) * 1000) : null,
    hasClaimableRewards: hasClaimable as boolean ?? false,
    totalNFTsMinted: global ? global[0].toString() : "0",
    totalRewardsDistributed: global ? formatEther(global[1]) : "0",
    dailyEmissionRate: global ? formatEther(global[2]) : "0",
    claimRewards,
    isPending,
    isConfirming,
    isSuccess,
    error,
    refetchRewards,
  };
}

// Hook for Referral operations
export function useReferralManager() {
  const { address } = useAccount();

  const { data: userData } = useReadContract({
    address: CONTRACTS.REFERRAL_MANAGER as `0x${string}`,
    abi: REFERRAL_MANAGER_ABI,
    functionName: "users",
    args: address ? [address] : undefined,
  });

  const { data: isRegistered } = useReadContract({
    address: CONTRACTS.REFERRAL_MANAGER as `0x${string}`,
    abi: REFERRAL_MANAGER_ABI,
    functionName: "isUserRegistered",
    args: address ? [address] : undefined,
  });

  const { data: teamByLevels } = useReadContract({
    address: CONTRACTS.REFERRAL_MANAGER as `0x${string}`,
    abi: REFERRAL_MANAGER_ABI,
    functionName: "getTeamByLevels",
    args: address ? [address] : undefined,
  });

  const { data: commissionCount } = useReadContract({
    address: CONTRACTS.REFERRAL_MANAGER as `0x${string}`,
    abi: REFERRAL_MANAGER_ABI,
    functionName: "getCommissionCount",
    args: address ? [address] : undefined,
  });

  const user = userData as [string, boolean, bigint, bigint, bigint] | undefined;
  const levels = teamByLevels as [bigint, bigint, bigint, bigint, bigint, bigint] | undefined;

  return {
    referrer: user ? user[0] : null,
    isRegistered: isRegistered as boolean ?? false,
    directReferrals: user ? user[2].toString() : "0",
    totalTeamSize: user ? user[3].toString() : "0",
    totalEarned: user ? formatEther(user[4]) : "0",
    teamByLevels: levels ? levels.map(l => l.toString()) : ["0", "0", "0", "0", "0", "0"],
    commissionCount: commissionCount?.toString() || "0",
  };
}

// Hook for USDT approval
export function useStablecoin() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.STABLECOIN as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.STABLECOIN as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.LIMITLESS_NFT as `0x${string}`] : undefined,
  });

  const { data: symbol } = useReadContract({
    address: CONTRACTS.STABLECOIN as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "symbol",
  });

  const approve = async (amount: string) => {
    const amountWei = parseEther(amount);
    writeContract({
      address: CONTRACTS.STABLECOIN as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.LIMITLESS_NFT as `0x${string}`, amountWei],
    });
  };

  return {
    balance: balance ? formatEther(balance as bigint) : "0",
    allowance: allowance ? formatEther(allowance as bigint) : "0",
    symbol: symbol as string || "USDT",
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error,
    refetchBalance,
    refetchAllowance,
  };
}
