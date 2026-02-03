import { useState, useEffect, useCallback } from "react";
import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseEther, formatEther, parseUnits, formatUnits } from "viem";
import {
  CONTRACTS,
  LIMITLESS_NFT_ABI,
  LIMITLESS_TOKEN_ABI,
  GENESIS_VAULT_ABI,
  REFERRAL_MANAGER_ABI,
  ERC20_ABI,
} from "../utils/contracts";

// Hook to read stablecoin decimals dynamically
// Supports 6-decimal tokens (Polygon USDC) and 18-decimal tokens
export function useStablecoinDecimals(): number {
  const { data: decimals } = useReadContract({
    address: CONTRACTS.STABLECOIN as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "decimals",
  });
  return (decimals as number) ?? 18;
}

// Hook for NFT operations
export function useLimitlessNFT() {
  const { address } = useAccount();
  const stablecoinDecimals = useStablecoinDecimals();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: nftPrice } = useReadContract({
    address: CONTRACTS.LIMITLESS_NFT as `0x${string}`,
    abi: LIMITLESS_NFT_ABI,
    functionName: "nftPrice",
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
    nftPrice: nftPrice
      ? formatUnits(nftPrice as bigint, stablecoinDecimals)
      : "1",
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

// Hook for Token operations — simplified (no circulatingSupply/lockedSupply)
export function useLimitlessToken() {
  const { address } = useAccount();

  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.LIMITLESS_TOKEN as `0x${string}`,
    abi: LIMITLESS_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: totalSupply } = useReadContract({
    address: CONTRACTS.LIMITLESS_TOKEN as `0x${string}`,
    abi: LIMITLESS_TOKEN_ABI,
    functionName: "totalSupply",
  });

  return {
    tokenBalance: tokenBalance ? formatEther(tokenBalance as bigint) : "0",
    totalSupply: totalSupply ? formatEther(totalSupply as bigint) : "0",
    refetchBalance,
  };
}

// Hook for Genesis Vault stats (replaces useBuybackPool)
export function useGenesisVault() {
  const stablecoinDecimals = useStablecoinDecimals();

  const { data: vaultStats, refetch: refetchStats } = useReadContract({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "getVaultStats",
  });

  const { data: floorPriceRaw } = useReadContract({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "getFloorPrice",
  });

  const { data: minRedemptionRaw } = useReadContract({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "minRedemptionAmount",
  });

  // Stats: [backing, distributed, claimed, redeemed, redeemedUSDC, floorPrice, activeNFTs, vaultTokenBalance, dailyReward]
  const stats = vaultStats as
    | [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]
    | undefined;

  // Parse values from stats
  const totalBackingValue = stats ? parseFloat(formatUnits(stats[0], stablecoinDecimals)) : 0;
  const totalDistributedValue = stats ? parseFloat(formatEther(stats[1])) : 0;
  const activeNFTsValue = stats ? Number(stats[6]) : 0;

  // Debug logging - remove after fixing
  console.log("useGenesisVault Debug:", {
    stablecoinDecimals,
    statsRaw: stats ? {
      backing: stats[0]?.toString(),
      distributed: stats[1]?.toString(),
      activeNFTs: stats[6]?.toString(),
      floorPriceFromStats: stats[5]?.toString(),
    } : "no stats",
    floorPriceRaw: floorPriceRaw?.toString(),
    totalBackingValue,
    activeNFTsValue,
  });

  // Calculate floor price
  // Actual floor price from contract (if tokens have been distributed)
  let floorPriceValue = 0;
  if (floorPriceRaw) {
    floorPriceValue = parseFloat(formatUnits(floorPriceRaw as bigint, stablecoinDecimals));
  } else if (stats && stats[5] > BigInt(0)) {
    floorPriceValue = parseFloat(formatUnits(stats[5], stablecoinDecimals));
  }

  // If actual floor price is 0 but we have backing and NFTs, calculate theoretical
  // Theoretical = totalBacking / activeNFTs (since each NFT earns 1 token/day)
  if (floorPriceValue === 0 && totalBackingValue > 0 && activeNFTsValue > 0) {
    floorPriceValue = totalBackingValue / activeNFTsValue;
  }

  console.log("Floor price calculated:", floorPriceValue);

  return {
    // USDC-denominated values — use stablecoin decimals
    totalBacking: totalBackingValue.toString(),
    totalRedeemedUSDC: stats ? formatUnits(stats[4], stablecoinDecimals) : "0",
    floorPrice: floorPriceValue.toString(),
    // Token-denominated values — always 18 decimals
    totalDistributed: stats ? formatEther(stats[1]) : "0",
    totalClaimed: stats ? formatEther(stats[2]) : "0",
    totalRedeemed: stats ? formatEther(stats[3]) : "0",
    activeNFTs: stats ? Number(stats[6]).toString() : "0",
    vaultTokenBalance: stats ? formatEther(stats[7]) : "0",
    dailyReward: stats ? formatEther(stats[8]) : "0",
    minRedemption: minRedemptionRaw
      ? formatEther(minRedemptionRaw as bigint)
      : "1",
    refetchStats,
  };
}

// Hook for Vault historical data — replaces useBuybackPoolHistory
export function useVaultHistory(snapshotCount: number = 30) {
  const stablecoinDecimals = useStablecoinDecimals();

  const { data: historyLength } = useReadContract({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "getHistoryLength",
  });

  const {
    data: snapshots,
    isLoading,
    refetch,
  } = useReadContract({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "getRecentSnapshots",
    args: [BigInt(snapshotCount)],
  });

  // Debug logging for snapshots
  console.log("useVaultHistory Debug:", {
    stablecoinDecimals,
    historyLength: historyLength?.toString(),
    snapshotsRaw: snapshots ? (snapshots as Array<any>).map(s => ({
      backing: s.totalBacking?.toString(),
      floorPrice: s.floorPrice?.toString(),
      activeNFTs: s.activeNFTs?.toString(),
    })) : "no snapshots",
  });

  const chartData = snapshots
    ? (
        snapshots as Array<{
          timestamp: bigint;
          totalBacking: bigint;
          totalDistributed: bigint;
          floorPrice: bigint;
          activeNFTs: bigint;
        }>
      ).map((snapshot) => {
        const totalBacking = parseFloat(
          formatUnits(snapshot.totalBacking, stablecoinDecimals),
        );
        const totalDistributed = parseFloat(formatEther(snapshot.totalDistributed));
        const activeNFTs = Number(snapshot.activeNFTs);

        // Calculate floor price - if no tokens distributed yet, calculate theoretical price
        // Theoretical = totalBacking / activeNFTs (backing per NFT, which equals price per token after 1 day)
        let floorPrice = parseFloat(
          formatUnits(snapshot.floorPrice, stablecoinDecimals),
        );

        // If floor price is 0 but we have backing and NFTs, calculate theoretical floor price
        // Each NFT earns 1 token/day, so after 1 day: floorPrice = totalBacking / totalNFTs
        if (floorPrice === 0 && totalBacking > 0 && activeNFTs > 0) {
          floorPrice = totalBacking / activeNFTs;
        }

        console.log("Chart point:", { totalBacking, floorPrice, activeNFTs });

        return {
          timestamp: Number(snapshot.timestamp) * 1000,
          date: new Date(Number(snapshot.timestamp) * 1000).toLocaleDateString(),
          totalBacking,
          totalDistributed,
          floorPrice,
          activeNFTs,
        };
      })
    : [];

  return {
    historyLength: historyLength ? Number(historyLength) : 0,
    chartData,
    isLoading,
    refetch,
  };
}

// Per-NFT rewards hook (replaces useLimitlessRewards)
export function useNFTRewards(tokenIds: bigint[] | undefined) {
  const { address } = useAccount();
  const stablecoinDecimals = useStablecoinDecimals();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [realtimePending, setRealtimePending] = useState("0");

  // getNFTInfo returns 7 fields: tokenBalance, pendingTokens, totalEarned, totalClaimed, totalRedeemed, liquidityValue, isActive
  const nftInfoContracts = (tokenIds || []).map((tokenId) => ({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "getNFTInfo" as const,
    args: [tokenId],
  }));

  // nftBalances returns lastDistributionTime for sub-day ticker
  const nftBalancesContracts = (tokenIds || []).map((tokenId) => ({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "nftBalances" as const,
    args: [tokenId],
  }));

  const { data: nftInfoResults, refetch: refetchInfo } = useReadContracts({
    contracts: nftInfoContracts,
    query: { enabled: (tokenIds || []).length > 0 },
  });

  const { data: nftBalancesResults, refetch: refetchBalances } =
    useReadContracts({
      contracts: nftBalancesContracts,
      query: { enabled: (tokenIds || []).length > 0 },
    });

  // Read wallet token balance
  const { data: walletBalance } = useReadContract({
    address: CONTRACTS.LIMITLESS_TOKEN as `0x${string}`,
    abi: LIMITLESS_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Build NFT data array from 7-field getNFTInfo
  const nfts = (tokenIds || []).map((tokenId, i) => {
    const infoResult = nftInfoResults?.[i];
    const balResult = nftBalancesResults?.[i];

    // getNFTInfo: [tokenBalance, pendingTokens, totalEarned, totalClaimed, totalRedeemed, liquidityValue, isActive]
    const info =
      infoResult?.status === "success"
        ? (infoResult.result as [bigint, bigint, bigint, bigint, bigint, bigint, boolean])
        : undefined;

    // nftBalances: [tokenBalance, totalEarned, totalClaimed, totalRedeemed, lastDistributionTime, isActive]
    const balData =
      balResult?.status === "success"
        ? (balResult.result as [bigint, bigint, bigint, bigint, bigint, boolean])
        : undefined;

    const lastDistributionTime = balData ? Number(balData[4]) : 0;

    return {
      tokenId: Number(tokenId),
      tokenBalance: info ? formatEther(info[0]) : "0",
      tokenBalanceRaw: info ? info[0] : BigInt(0),
      pending: info ? formatEther(info[1]) : "0",
      pendingRaw: info ? info[1] : BigInt(0),
      totalEarned: info ? formatEther(info[2]) : "0",
      totalClaimed: info ? formatEther(info[3]) : "0",
      totalRedeemed: info ? formatEther(info[4]) : "0",
      liquidityValue: info ? formatUnits(info[5], stablecoinDecimals) : "0",
      isActive: info ? info[6] : false,
      lastDistributionTime,
    };
  });

  // Aggregate totals
  const totalTokenBalance = nfts.reduce(
    (sum, nft) => sum + parseFloat(nft.tokenBalance),
    0,
  );
  const totalPending = nfts.reduce(
    (sum, nft) => sum + parseFloat(nft.pending),
    0,
  );
  const walletBal = walletBalance
    ? parseFloat(formatEther(walletBalance as bigint))
    : 0;
  const totalAvailable = totalTokenBalance + totalPending + walletBal;

  // Real-time sub-day ticker: compute fractional pending from lastDistributionTime
  const nftCount = nfts.filter((n) => n.isActive).length;

  // Calculate realtime accrued tokens based on elapsed time
  // Each NFT earns 1 token per day, starting from 1 (base daily reward)
  // So accrued = nftCount * 1 (base) + fractional progress toward next token
  const computeRealtimeAccrued = useCallback(() => {
    if (nftCount === 0) return 0;
    const now = Math.floor(Date.now() / 1000);
    let totalAccrued = 0;

    for (const nft of nfts) {
      if (!nft.isActive) continue;

      // Base: 1 token per NFT (the daily reward you're earning)
      const baseReward = 1;

      // If lastDistributionTime is 0, NFT just registered - show base only
      if (nft.lastDistributionTime === 0) {
        totalAccrued += baseReward;
        continue;
      }

      const elapsed = now - nft.lastDistributionTime;
      // Fractional progress within current day cycle
      const subDaySeconds = elapsed % 86400;
      const fractionalProgress = subDaySeconds / 86400;

      // Total for this NFT = base (1) + fractional progress toward next token
      totalAccrued += baseReward + fractionalProgress;
    }
    return totalAccrued;
  }, [nfts, nftCount]);

  // Initialize and tick the realtime accrued display
  // This shows: base (1 per NFT) + fractional progress + any contract pending
  useEffect(() => {
    const realtimeAccrued = computeRealtimeAccrued();
    // Add contract pending (full days already credited but not claimed)
    setRealtimePending((totalPending + realtimeAccrued).toFixed(6));
  }, [totalPending, computeRealtimeAccrued]);

  useEffect(() => {
    if (nftCount === 0) {
      setRealtimePending("0");
      return;
    }
    // Each NFT earns 1 token per day = 1/86400 tokens per second
    const perSecond = nftCount / 86400;
    const interval = setInterval(() => {
      setRealtimePending((prev) => {
        const current = parseFloat(prev);
        return (current + perSecond).toFixed(6);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [nftCount]);

  // Auto-refresh contract data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchInfo();
      refetchBalances();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchInfo, refetchBalances]);

  const distribute = async (tokenId: bigint) => {
    writeContract({
      address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
      abi: GENESIS_VAULT_ABI,
      functionName: "distributeToNFT",
      args: [tokenId],
    });
  };

  const refetch = useCallback(async () => {
    await Promise.all([refetchInfo(), refetchBalances()]);
  }, [refetchInfo, refetchBalances]);

  return {
    nfts,
    totalTokenBalance: totalTokenBalance.toFixed(6),
    totalPending: totalPending.toFixed(6),
    totalAvailable: totalAvailable.toFixed(6),
    realtimePending,
    distribute,
    isPending,
    isConfirming,
    isSuccess,
    error,
    refetch,
  };
}

// Hook for vault write actions (replaces useClaimAndRedeem)
export function useVaultActions() {
  const { address } = useAccount();

  const {
    writeContract: writeClaimContract,
    data: claimHash,
    isPending: isClaimPending,
    error: claimError,
  } = useWriteContract();

  const {
    writeContract: writeRedeemNFTContract,
    data: redeemNFTHash,
    isPending: isRedeemNFTPending,
    error: redeemNFTError,
  } = useWriteContract();

  const {
    writeContract: writeRedeemWalletContract,
    data: redeemWalletHash,
    isPending: isRedeemWalletPending,
    error: redeemWalletError,
  } = useWriteContract();

  const {
    writeContract: writeApproveContract,
    data: approveHash,
    isPending: isApprovePending,
  } = useWriteContract();

  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } =
    useWaitForTransactionReceipt({ hash: claimHash });

  const { isLoading: isRedeemNFTConfirming, isSuccess: isRedeemNFTSuccess } =
    useWaitForTransactionReceipt({ hash: redeemNFTHash });

  const {
    isLoading: isRedeemWalletConfirming,
    isSuccess: isRedeemWalletSuccess,
  } = useWaitForTransactionReceipt({ hash: redeemWalletHash });

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });

  // Check token allowance for vault (needed for redeemFromWallet)
  const { data: tokenAllowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.LIMITLESS_TOKEN as `0x${string}`,
    abi: LIMITLESS_TOKEN_ABI,
    functionName: "allowance",
    args: address
      ? [address, CONTRACTS.GENESIS_VAULT as `0x${string}`]
      : undefined,
  });

  const claimTokens = async (tokenId: bigint, amount: string) => {
    const amountWei = parseEther(amount);
    writeClaimContract({
      address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
      abi: GENESIS_VAULT_ABI,
      functionName: "claimTokens",
      args: [tokenId, amountWei],
    });
  };

  const redeemFromNFT = async (tokenId: bigint, amount: string) => {
    const amountWei = parseEther(amount);
    writeRedeemNFTContract({
      address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
      abi: GENESIS_VAULT_ABI,
      functionName: "redeemFromNFT",
      args: [tokenId, amountWei],
    });
  };

  const approveTokenForVault = async (amount: string) => {
    const amountWei = parseEther(amount);
    writeApproveContract({
      address: CONTRACTS.LIMITLESS_TOKEN as `0x${string}`,
      abi: LIMITLESS_TOKEN_ABI,
      functionName: "approve",
      args: [CONTRACTS.GENESIS_VAULT as `0x${string}`, amountWei],
    });
  };

  const redeemFromWallet = async (amount: string) => {
    const amountWei = parseEther(amount);
    writeRedeemWalletContract({
      address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
      abi: GENESIS_VAULT_ABI,
      functionName: "redeemFromWallet",
      args: [amountWei],
    });
  };

  const isPending =
    isClaimPending ||
    isRedeemNFTPending ||
    isRedeemWalletPending ||
    isApprovePending;
  const isConfirming =
    isClaimConfirming ||
    isRedeemNFTConfirming ||
    isRedeemWalletConfirming ||
    isApproveConfirming;
  const isSuccess =
    isClaimSuccess || isRedeemNFTSuccess || isRedeemWalletSuccess;
  const combinedError = claimError || redeemNFTError || redeemWalletError;

  return {
    claimTokens,
    redeemFromNFT,
    redeemFromWallet,
    approveTokenForVault,
    tokenAllowance: tokenAllowance
      ? formatEther(tokenAllowance as bigint)
      : "0",
    refetchAllowance,
    isApprovePending,
    isApproveConfirming,
    isApproveSuccess,
    isPending,
    isConfirming,
    isSuccess,
    isClaimSuccess,
    isRedeemNFTSuccess,
    isRedeemWalletSuccess,
    error: combinedError,
  };
}

// Hook for Referral operations
export function useReferralManager() {
  const { address } = useAccount();
  const stablecoinDecimals = useStablecoinDecimals();

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
    totalEarned: user ? formatUnits(user[4], stablecoinDecimals) : "0",
    teamByLevels: levels
      ? levels.map((l) => l.toString())
      : ["0", "0", "0", "0", "0", "0"],
    commissionCount: commissionCount?.toString() || "0",
  };
}

// Hook for USDC approval — uses dynamic stablecoin decimals
export function useStablecoin() {
  // chain -- > add chain to the use Account values
  const { address, isConnected } = useAccount();
  const stablecoinDecimals = useStablecoinDecimals();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.STABLECOIN as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

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
    const amountWei = parseUnits(amount, stablecoinDecimals);
    writeContract({
      address: CONTRACTS.STABLECOIN as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.LIMITLESS_NFT as `0x${string}`, amountWei],
    });
  };

  return {
    balance: balance ? formatUnits(balance as bigint, stablecoinDecimals) : "0",
    allowance: allowance
      ? formatUnits(allowance as bigint, stablecoinDecimals)
      : "0",
    symbol: (symbol as string) || "USDC",
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
