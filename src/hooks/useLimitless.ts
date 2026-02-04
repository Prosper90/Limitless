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
  // Note: 'distributed' returns real-time accrued tokens from contract
  const stats = vaultStats as
    | [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]
    | undefined;

  // Parse values from stats
  const totalBackingValue = stats
    ? parseFloat(formatUnits(stats[0], stablecoinDecimals))
    : 0;

  // Get raw accrued value and active NFTs
  const rawAccrued = stats ? parseFloat(formatEther(stats[1])) : 0;
  const activeNFTsCount = stats ? Number(stats[6]) : 0;

  // Calculate effective distributed: activeNFTs (base) + rawAccrued (time-based)
  // Show whole tokens only - tokens appear after complete 24-hour periods
  const effectiveDistributed = activeNFTsCount + Math.floor(rawAccrued);

  // Floor price now calculated by contract using real-time accrued tokens
  // No need for theoretical calculation - contract handles it
  let floorPriceValue = 0;
  if (floorPriceRaw) {
    floorPriceValue = parseFloat(
      formatUnits(floorPriceRaw as bigint, stablecoinDecimals),
    );
  } else if (stats && stats[5] > BigInt(0)) {
    floorPriceValue = parseFloat(formatUnits(stats[5], stablecoinDecimals));
  }

  return {
    // USDC-denominated values — use stablecoin decimals
    totalBacking: totalBackingValue.toString(),
    totalRedeemedUSDC: stats ? formatUnits(stats[4], stablecoinDecimals) : "0",
    floorPrice: floorPriceValue.toString(),
    // Token-denominated values — always 18 decimals
    // totalDistributed uses effective value: max(accrued, activeNFTs) to match floor price logic
    totalDistributed: effectiveDistributed.toString(),
    totalClaimed: stats ? formatEther(stats[2]) : "0",
    totalRedeemed: stats ? formatEther(stats[3]) : "0",
    activeNFTs: activeNFTsCount.toString(),
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

  // Get live floor price to use for the most recent data point
  // (Snapshots may have stale floor price since they're taken before NFT registration)
  const { data: liveFloorPrice } = useReadContract({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "getFloorPrice",
  });

  // Get live total accrued tokens
  const { data: liveTotalAccrued } = useReadContract({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "getTotalAccruedTokens",
  });

  // Get live total backing
  const { data: liveTotalBacking } = useReadContract({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "totalBackingUSDT",
  });

  const liveFloorPriceValue = liveFloorPrice
    ? parseFloat(formatUnits(liveFloorPrice as bigint, stablecoinDecimals))
    : 0;

  const liveTotalAccruedValue = liveTotalAccrued
    ? parseFloat(formatEther(liveTotalAccrued as bigint))
    : 0;

  const liveTotalBackingValue = liveTotalBacking
    ? parseFloat(formatUnits(liveTotalBacking as bigint, stablecoinDecimals))
    : 0;

  const chartData = snapshots
    ? (
        snapshots as Array<{
          timestamp: bigint;
          totalBacking: bigint;
          totalDistributed: bigint;
          floorPrice: bigint;
          activeNFTs: bigint;
        }>
      ).map((snapshot, index, arr) => {
        const totalBacking = parseFloat(
          formatUnits(snapshot.totalBacking, stablecoinDecimals),
        );
        const totalDistributed = parseFloat(
          formatEther(snapshot.totalDistributed),
        );
        const activeNFTs = Number(snapshot.activeNFTs);

        // For the most recent snapshot, use live values if snapshot values are 0
        // This handles the case where snapshot is taken before NFT registration
        const isLastSnapshot = index === arr.length - 1;

        // Recalculate floor price from backing/activeNFTs to avoid snapshot timing issue
        // (Snapshots are taken before NFT registration, causing incorrect floor price)
        let floorPrice = 0;
        if (activeNFTs > 0) {
          // Floor price = backing / activeNFTs (each NFT represents 1 token minimum)
          floorPrice = totalBacking / activeNFTs;
        } else if (isLastSnapshot && liveFloorPriceValue > 0) {
          // Fallback to live floor price for latest snapshot if no NFTs in snapshot
          floorPrice = liveFloorPriceValue;
        }

        // Calculate effective distributed: activeNFTs (base) + accrued (time-based)
        // This matches the frontend display where each NFT shows "1 base + fractional accrual"
        const effectiveTotalDistributed = activeNFTs + totalDistributed;
        const effectiveLiveDistributed = activeNFTs + liveTotalAccruedValue;

        return {
          timestamp: Number(snapshot.timestamp) * 1000,
          date: new Date(
            Number(snapshot.timestamp) * 1000,
          ).toLocaleDateString(),
          totalBacking: isLastSnapshot && totalBacking === 0 ? liveTotalBackingValue : totalBacking,
          totalDistributed: isLastSnapshot && effectiveTotalDistributed === 0 ? effectiveLiveDistributed : effectiveTotalDistributed,
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

  // Read user's bonus balance (from referral rewards)
  const { data: bonusBalanceRaw, refetch: refetchBonus } = useReadContract({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "userBonusBalance",
    args: address ? [address] : undefined,
  });

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
        ? (infoResult.result as [
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            boolean,
          ])
        : undefined;

    // nftBalances: [tokenBalance, totalEarned, totalClaimed, totalRedeemed, lastDistributionTime, registrationTime, isActive]
    const balData =
      balResult?.status === "success"
        ? (balResult.result as [
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            boolean,
          ])
        : undefined;

    const lastDistributionTime = balData ? Number(balData[4]) : 0;
    const isActive = info ? info[6] : false;

    // Display balance: whole tokens only (base 1 + completed 24-hour cycles)
    // No fractional progress - tokens only appear after full 24 hours
    let displayBalance = 0;
    if (isActive) {
      const baseReward = 1; // Each NFT has 1 base token
      const pendingTokens = info ? parseFloat(formatEther(info[1])) : 0; // Whole tokens from contract
      displayBalance = baseReward + pendingTokens;
    }

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
      isActive,
      lastDistributionTime,
      // Display balance = whole tokens only (base + completed days)
      displayBalance: Math.floor(displayBalance).toString(),
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
  const bonusBalance = bonusBalanceRaw
    ? parseFloat(formatEther(bonusBalanceRaw as bigint))
    : 0;
  const totalAvailable = totalTokenBalance + totalPending + walletBal + bonusBalance;

  // Calculate whole tokens only: base (1 per NFT) + pending (whole tokens from contract)
  // No fractional display - tokens only appear after complete 24-hour periods
  const nftCount = nfts.filter((n) => n.isActive).length;

  // Whole tokens = nftCount (base, 1 per active NFT) + totalPending (completed 24h cycles)
  // This updates when contract data refreshes (every 30 seconds or on user action)
  useEffect(() => {
    const wholeTokens = nftCount + Math.floor(totalPending);
    setRealtimePending(wholeTokens.toString());
  }, [nftCount, totalPending]);

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
    await Promise.all([refetchInfo(), refetchBalances(), refetchBonus()]);
  }, [refetchInfo, refetchBalances, refetchBonus]);

  return {
    nfts,
    totalTokenBalance: Math.floor(totalTokenBalance).toString(),
    totalPending: Math.floor(totalPending).toString(),
    totalAvailable: Math.floor(totalAvailable).toString(),
    realtimePending,
    bonusBalance: Math.floor(bonusBalance).toString(),
    distribute,
    isPending,
    isConfirming,
    isSuccess,
    error,
    refetch,
    refetchBonus,
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
    writeContract: writeRedeemBonusContract,
    data: redeemBonusHash,
    isPending: isRedeemBonusPending,
    error: redeemBonusError,
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

  const {
    isLoading: isRedeemBonusConfirming,
    isSuccess: isRedeemBonusSuccess,
  } = useWaitForTransactionReceipt({ hash: redeemBonusHash });

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

  const redeemFromBonus = async (amount: string) => {
    const amountWei = parseEther(amount);
    writeRedeemBonusContract({
      address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
      abi: GENESIS_VAULT_ABI,
      functionName: "redeemFromBonus",
      args: [amountWei],
    });
  };

  const isPending =
    isClaimPending ||
    isRedeemNFTPending ||
    isRedeemWalletPending ||
    isRedeemBonusPending ||
    isApprovePending;
  const isConfirming =
    isClaimConfirming ||
    isRedeemNFTConfirming ||
    isRedeemWalletConfirming ||
    isRedeemBonusConfirming ||
    isApproveConfirming;
  const isSuccess =
    isClaimSuccess || isRedeemNFTSuccess || isRedeemWalletSuccess || isRedeemBonusSuccess;
  const combinedError = claimError || redeemNFTError || redeemWalletError || redeemBonusError;

  return {
    claimTokens,
    redeemFromNFT,
    redeemFromWallet,
    redeemFromBonus,
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
    isRedeemBonusSuccess,
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
