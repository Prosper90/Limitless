import { useState, useEffect, useCallback } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import {
  CONTRACTS,
  LIMITLESS_NFT_ABI,
  LIMITLESS_TOKEN_ABI,
  LIQUIDITY_POOL_ABI,
  REFERRAL_MANAGER_ABI,
  LIMITLESS_REWARDS_ABI,
  ERC20_ABI,
} from "../utils/contracts";

// Constants for reward calculation
const DAILY_REWARD_PER_NFT = 1; // 1 token per NFT per day
const SECONDS_PER_DAY = 86400;

// Contract deployment date (2025-01-19) - used for global circulation calculation
const CONTRACT_DEPLOYMENT_TIMESTAMP = new Date("2025-01-19T00:00:00Z").getTime() / 1000;

// Hook for NFT operations
export function useLimitlessNFT() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

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

  const mintNFT = async (
    referrer: string = "0x0000000000000000000000000000000000000000",
  ) => {
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
    circulatingSupply: circulatingSupply
      ? formatEther(circulatingSupply as bigint)
      : "0",
    lockedSupply: lockedSupply ? formatEther(lockedSupply as bigint) : "0",
    totalSupply: totalSupply ? formatEther(totalSupply as bigint) : "0",
    refetchBalance,
  };
}

// Hook for Liquidity Pool operations
export function useLiquidityPool() {
  // const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

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

  // const calculateRedemption = async (amount: string) => {
  //   const amountWei = parseEther(amount);
  //   // This is a view function, would need to be called separately
  //   return "0";
  // };

  const redeemTokens = async (amount: string) => {
    const amountWei = parseEther(amount);
    writeContract({
      address: CONTRACTS.LIQUIDITY_POOL as `0x${string}`,
      abi: LIQUIDITY_POOL_ABI,
      functionName: "redeemTokens",
      args: [amountWei],
    });
  };

  const stats = poolStats as
    | [bigint, bigint, bigint, bigint, bigint]
    | undefined;

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

// Hook for Liquidity Pool historical data (for charts)
export function useLiquidityPoolHistory(snapshotCount: number = 30) {
  const { data: historyLength } = useReadContract({
    address: CONTRACTS.LIQUIDITY_POOL as `0x${string}`,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "getHistoryLength",
  });

  const { data: snapshots, isLoading, refetch } = useReadContract({
    address: CONTRACTS.LIQUIDITY_POOL as `0x${string}`,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "getRecentSnapshots",
    args: [BigInt(snapshotCount)],
  });

  // Transform snapshots into chart-friendly format
  const chartData = snapshots
    ? (snapshots as Array<{
        timestamp: bigint;
        tvl: bigint;
        circulatingSupply: bigint;
        tokenPrice: bigint;
      }>).map((snapshot) => ({
        timestamp: Number(snapshot.timestamp) * 1000, // Convert to milliseconds
        date: new Date(Number(snapshot.timestamp) * 1000).toLocaleDateString(),
        tvl: parseFloat(formatEther(snapshot.tvl)),
        circulatingSupply: parseFloat(formatEther(snapshot.circulatingSupply)),
        tokenPrice: parseFloat(formatEther(snapshot.tokenPrice)),
      }))
    : [];

  return {
    historyLength: historyLength ? Number(historyLength) : 0,
    chartData,
    isLoading,
    refetch,
  };
}

// Hook for Rewards operations with real-time calculation
export function useLimitlessRewards() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // State for real-time pending rewards
  const [realtimePendingRewards, setRealtimePendingRewards] = useState("0");
  const [realtimeGlobalPending, setRealtimeGlobalPending] = useState("0");

  const { data: rewardInfo, refetch: refetchRewards } = useReadContract({
    address: CONTRACTS.LIMITLESS_REWARDS as `0x${string}`,
    abi: LIMITLESS_REWARDS_ABI,
    functionName: "getUserRewardInfo",
    args: address ? [address] : undefined,
  });

  const { data: hasClaimable, refetch: refetchHasClaimable } = useReadContract({
    address: CONTRACTS.LIMITLESS_REWARDS as `0x${string}`,
    abi: LIMITLESS_REWARDS_ABI,
    functionName: "hasClaimableRewards",
    args: address ? [address] : undefined,
  });

  const { data: globalStats, refetch: refetchGlobalStats } = useReadContract({
    address: CONTRACTS.LIMITLESS_REWARDS as `0x${string}`,
    abi: LIMITLESS_REWARDS_ABI,
    functionName: "getGlobalStats",
  });

  const info = rewardInfo as
    | [bigint, bigint, bigint, bigint, bigint]
    | undefined;
  const global = globalStats as [bigint, bigint, bigint] | undefined;

  // Extract values from contract data
  const nftCount = info ? Number(info[0]) : 0;
  const lastClaimTime = info ? Number(info[1]) : 0;
  const totalNFTsMinted = global ? Number(global[0]) : 0;

  // Calculate real-time pending rewards (updates every second)
  const calculateRealtimeRewards = useCallback(() => {
    if (nftCount === 0 || lastClaimTime === 0) {
      setRealtimePendingRewards("0");
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const timeElapsed = now - lastClaimTime;

    // Calculate rewards with decimal precision (not just full days)
    const daysElapsed = timeElapsed / SECONDS_PER_DAY;
    const pendingRewards = daysElapsed * nftCount * DAILY_REWARD_PER_NFT;

    setRealtimePendingRewards(pendingRewards.toFixed(6));
  }, [nftCount, lastClaimTime]);

  // Calculate global circulation (total accrued by all NFT holders)
  const calculateGlobalPending = useCallback(() => {
    if (totalNFTsMinted === 0) {
      setRealtimeGlobalPending("0");
      return;
    }

    // Calculate days since contract deployment
    const now = Math.floor(Date.now() / 1000);
    const daysSinceDeployment = (now - CONTRACT_DEPLOYMENT_TIMESTAMP) / SECONDS_PER_DAY;

    // Global circulation = totalNFTsMinted × daysSinceDeployment × dailyReward
    // This represents the total tokens accrued by all NFT holders
    const globalCirculation = totalNFTsMinted * daysSinceDeployment * DAILY_REWARD_PER_NFT;

    setRealtimeGlobalPending(globalCirculation.toFixed(6));
  }, [totalNFTsMinted]);

  // Real-time update interval (every second for smooth animation)
  useEffect(() => {
    calculateRealtimeRewards();
    calculateGlobalPending();

    const interval = setInterval(() => {
      calculateRealtimeRewards();
      calculateGlobalPending(); // Also update global circulation in real-time
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [calculateRealtimeRewards, calculateGlobalPending]);

  // Auto-refresh contract data every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refetchRewards();
      refetchHasClaimable();
      refetchGlobalStats();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [refetchRewards, refetchHasClaimable, refetchGlobalStats]);

  const claimRewards = async () => {
    writeContract({
      address: CONTRACTS.LIMITLESS_REWARDS as `0x${string}`,
      abi: LIMITLESS_REWARDS_ABI,
      functionName: "claimRewards",
    });
  };

  // Refetch all data
  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchRewards(),
      refetchHasClaimable(),
      refetchGlobalStats(),
    ]);
  }, [refetchRewards, refetchHasClaimable, refetchGlobalStats]);

  return {
    nftCount: nftCount.toString(),
    lastClaimTime: lastClaimTime ? new Date(lastClaimTime * 1000) : null,
    totalClaimed: info ? formatEther(info[2]) : "0",
    // Use real-time calculated pending rewards instead of contract value
    pendingRewards: realtimePendingRewards,
    // Also keep the contract value available if needed
    contractPendingRewards: info ? formatEther(info[3]) : "0",
    nextClaimTime: info ? new Date(Number(info[4]) * 1000) : null,
    hasClaimableRewards: parseFloat(realtimePendingRewards) > 0 || (hasClaimable as boolean) || false,
    totalNFTsMinted: totalNFTsMinted.toString(),
    totalRewardsDistributed: global ? formatEther(global[1]) : "0",
    dailyEmissionRate: global ? formatEther(global[2]) : "0",
    // Global pending estimate for circulation display
    globalPendingEstimate: realtimeGlobalPending,
    claimRewards,
    isPending,
    isConfirming,
    isSuccess,
    error,
    refetchRewards: refetchAll,
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

  const user = userData as
    | [string, boolean, bigint, bigint, bigint]
    | undefined;
  const levels = teamByLevels as
    | [bigint, bigint, bigint, bigint, bigint, bigint]
    | undefined;

  return {
    referrer: user ? user[0] : null,
    isRegistered: (isRegistered as boolean) ?? false,
    directReferrals: user ? user[2].toString() : "0",
    totalTeamSize: user ? user[3].toString() : "0",
    totalEarned: user ? formatEther(user[4]) : "0",
    teamByLevels: levels
      ? levels.map((l) => l.toString())
      : ["0", "0", "0", "0", "0", "0"],
    commissionCount: commissionCount?.toString() || "0",
  };
}

// Hook for combined claim and burn operations
export function useClaimAndBurn() {
  const { address } = useAccount();
  const {
    writeContract: writeClaimContract,
    data: claimHash,
    isPending: isClaimPending,
  } = useWriteContract();
  const {
    writeContract: writeBurnContract,
    data: burnHash,
    isPending: isBurnPending,
    error: burnError,
  } = useWriteContract();

  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } =
    useWaitForTransactionReceipt({
      hash: claimHash,
    });

  const { isLoading: isBurnConfirming, isSuccess: isBurnSuccess } =
    useWaitForTransactionReceipt({
      hash: burnHash,
    });

  const { data: rewardInfo } = useReadContract({
    address: CONTRACTS.LIMITLESS_REWARDS as `0x${string}`,
    abi: LIMITLESS_REWARDS_ABI,
    functionName: "getUserRewardInfo",
    args: address ? [address] : undefined,
  });

  const info = rewardInfo as
    | [bigint, bigint, bigint, bigint, bigint]
    | undefined;
  const pendingRewardsRaw = info ? info[3] : BigInt(0);
  const hasPendingRewards = pendingRewardsRaw > BigInt(0);

  const claimAndBurn = async (
    burnAmount: string,
    onClaimComplete?: () => void,
  ) => {
    const amountWei = parseEther(burnAmount);

    // If there are pending rewards, claim first
    if (hasPendingRewards) {
      writeClaimContract(
        {
          address: CONTRACTS.LIMITLESS_REWARDS as `0x${string}`,
          abi: LIMITLESS_REWARDS_ABI,
          functionName: "claimRewards",
        },
        {
          onSuccess: () => {
            onClaimComplete?.();
            // After claim succeeds, proceed with burn
            writeBurnContract({
              address: CONTRACTS.LIQUIDITY_POOL as `0x${string}`,
              abi: LIQUIDITY_POOL_ABI,
              functionName: "redeemTokens",
              args: [amountWei],
            });
          },
        },
      );
    } else {
      // No pending rewards, just burn directly
      writeBurnContract({
        address: CONTRACTS.LIQUIDITY_POOL as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: "redeemTokens",
        args: [amountWei],
      });
    }
  };

  return {
    claimAndBurn,
    hasPendingRewards,
    pendingRewards: formatEther(pendingRewardsRaw),
    isClaimPending,
    isClaimConfirming,
    isClaimSuccess,
    isBurnPending,
    isBurnConfirming,
    isBurnSuccess,
    isPending: isClaimPending || isBurnPending,
    isConfirming: isClaimConfirming || isBurnConfirming,
    isSuccess: isBurnSuccess,
    error: burnError,
  };
}

// Check token balance using useReadContract (more reliable for ERC20)
// export function useTokenBalance(
//   tokenAddress: `0x${string}`,
//   accountAddress: `0x${string}` | undefined,
// ) {
//   const { data, isLoading, error } = useReadContract({
//     address: tokenAddress,
//     abi: ERC20_ABI,
//     functionName: "balanceOf",
//     args: accountAddress ? [accountAddress] : undefined,
//     query: {
//       enabled: !!accountAddress && accountAddress !== "0x0",
//     },
//   });

//   console.log(data, "At rest soilder");

//   return {
//     data: data as bigint | undefined,
//     isLoading,
//     error,
//   };
// }

// Hook for USDT approval
export function useStablecoin() {
  const { address, isConnected, chain } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Debug: Log connection state
  console.log("=== useStablecoin Debug ===");
  console.log("Connected:", isConnected);
  console.log("Chain:", chain?.name, chain?.id);
  console.log("User Address:", address);
  console.log("Contract Address:", CONTRACTS.STABLECOIN);

  const {
    data: balance,
    refetch: refetchBalance,
    error: balanceError,
    isLoading: balanceLoading,
    status: balanceStatus,
  } = useReadContract({
    address: CONTRACTS.STABLECOIN as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  console.log("Balance Status:", balanceStatus);
  console.log("Balance Loading:", balanceLoading);
  console.log("Balance Data:", balance);
  console.log("Balance Error:", balanceError);
  console.log("=== End Debug ===");

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.STABLECOIN as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address
      ? [address, CONTRACTS.LIMITLESS_NFT as `0x${string}`]
      : undefined,
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
    symbol: (symbol as string) || "USDT",
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error,
    refetchBalance,
    refetchAllowance,
    hash,
  };
}
