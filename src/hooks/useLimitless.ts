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
  // const stablecoinDecimals = useStablecoinDecimals();
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

  console.log(
    nftPrice,
    "Original checker oooooo",
    formatUnits(nftPrice as bigint, 18),
  );
  return {
    nftPrice: nftPrice ? formatUnits(nftPrice as bigint, 6) : "1",
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

// Hook for Genesis Vault stats
export function useGenesisVault() {
  const stablecoinDecimals = useStablecoinDecimals();

  const { data: vaultStats, refetch: refetchStats } = useReadContract({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "getVaultStats",
  });

  const { data: minRedemptionRaw } = useReadContract({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "minRedemptionAmount",
  });

  const { data: maxSupplyData } = useReadContract({
    address: CONTRACTS.LIMITLESS_TOKEN as `0x${string}`,
    abi: LIMITLESS_TOKEN_ABI,
    functionName: "MAX_SUPPLY",
  });

  // Auto-refresh vault stats every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetchStats]);

  // Stats: [backing, distributed, claimed, redeemed, redeemedUSDC, floorPrice, activeNFTs, vaultTokenBalance, dailyReward]
  const stats = vaultStats as
    | [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]
    | undefined;

  const totalBackingValue = stats
    ? parseFloat(formatUnits(stats[0], stablecoinDecimals))
    : 0;

  const rawAccrued = stats ? parseFloat(formatEther(stats[1])) : 0;
  const activeNFTsCount = stats ? Number(stats[6]) : 0;
  let floorPriceValueFromContract = stats
    ? parseFloat(formatUnits(stats[5], 18))
    : 0; // Use 18 decimals as contract returns 1e18 scaled value

  // --- Fallback calculation if contract floorPrice is 0 ---
  // Contract returns 0 due to integer division underflow, so we calculate it here:
  // floorPrice = totalBackingUSDT / MAX_SUPPLY
  let finalFloorPrice = floorPriceValueFromContract;
  if (finalFloorPrice === 0 && stats && maxSupplyData) {
    const rawTotalBackingUSDT = stats[0]; // bigint
    const rawMaxSupply = maxSupplyData as bigint; // bigint

    const totalBackingUSDAmount = parseFloat(
      formatUnits(rawTotalBackingUSDT, stablecoinDecimals),
    ); // e.g., 1.25
    const totalTokens = parseFloat(formatEther(rawMaxSupply)); // e.g., 1e15 (1 quadrillion tokens)

    if (totalTokens > 0 && totalBackingUSDAmount > 0) {
      finalFloorPrice = totalBackingUSDAmount / totalTokens; // This yields 1.25 / 1e15 = 1.25e-15
      console.log("Floor price fallback calculation:", {
        totalBackingUSDAmount,
        totalTokens,
        finalFloorPrice,
      });
    }
  } // --- End Fallback ---

  const effectiveDistributed = activeNFTsCount + Math.floor(rawAccrued);

  return {
    totalBacking: totalBackingValue.toString(),
    totalRedeemedUSDC: stats ? formatUnits(stats[4], stablecoinDecimals) : "0",
    floorPrice: finalFloorPrice, // Use the final calculated floor price
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

// Hook for Vault historical data
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

  // Read MAX_SUPPLY for floor price calculation (contract returns 0 due to underflow)
  const { data: maxSupplyData } = useReadContract({
    address: CONTRACTS.LIMITLESS_TOKEN as `0x${string}`,
    abi: LIMITLESS_TOKEN_ABI,
    functionName: "MAX_SUPPLY",
  });

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Calculate MAX_SUPPLY in token units (1e15 tokens = 1,000,000,000,000,000)
  const maxSupplyTokens = maxSupplyData
    ? parseFloat(formatEther(maxSupplyData as bigint))
    : 0;

  // Debug log for MAX_SUPPLY
  if (maxSupplyData) {
    console.log("useVaultHistory: MAX_SUPPLY data", {
      raw: maxSupplyData.toString(),
      formatted: maxSupplyTokens,
    });
  }

  const chartData = snapshots
    ? (
        snapshots as Array<{
          timestamp: bigint;
          totalBacking: bigint;
          totalDistributed: bigint;
          floorPrice: bigint;
          activeNFTs: bigint;
        }>
      ).map((snapshot, index) => {
        const backingValue = parseFloat(
          formatUnits(snapshot.totalBacking, stablecoinDecimals),
        );

        // Calculate floor price from backing / MAX_SUPPLY
        // Contract's floorPrice is 0 due to integer underflow, so we calculate it here
        const calculatedFloorPrice =
          maxSupplyTokens > 0 && backingValue > 0
            ? backingValue / maxSupplyTokens
            : 0;

        // Debug log for first snapshot
        if (index === 0 && backingValue > 0) {
          console.log("useVaultHistory: Chart floor price calc", {
            backingValue,
            maxSupplyTokens,
            calculatedFloorPrice,
          });
        }

        return {
          timestamp: Number(snapshot.timestamp) * 1000,
          date: new Date(
            Number(snapshot.timestamp) * 1000,
          ).toLocaleDateString(),
          totalBacking: backingValue,
          totalDistributed: parseFloat(formatEther(snapshot.totalDistributed)),
          floorPrice: calculatedFloorPrice,
          activeNFTs: Number(snapshot.activeNFTs),
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

    // Display balance = tokenBalance + pending (per-second accrual, real on-chain value)
    const displayBalance = info
      ? parseFloat(formatEther(info[0])) + parseFloat(formatEther(info[1]))
      : 0;

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
      displayBalance: displayBalance.toFixed(4),
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

  const totalAvailable =
    totalTokenBalance + totalPending + walletBal + bonusBalance;

  // Per-second accrual: tokens accrue continuously
  useEffect(() => {
    const total = totalTokenBalance + totalPending;
    setRealtimePending(total.toFixed(4));
  }, [totalTokenBalance, totalPending]);

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
    totalTokenBalance: totalTokenBalance.toFixed(4),
    totalPending: totalPending.toFixed(4),
    totalAvailable: totalAvailable.toFixed(4),
    realtimePending,
    bonusBalance: bonusBalance.toFixed(4),
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
    isClaimSuccess ||
    isRedeemNFTSuccess ||
    isRedeemWalletSuccess ||
    isRedeemBonusSuccess;
  const combinedError =
    claimError || redeemNFTError || redeemWalletError || redeemBonusError;

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
