import { useState, useEffect, useCallback } from "react";
import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import {
  CONTRACTS,
  LIMITLESS_NFT_ABI,
  LIMITLESS_TOKEN_ABI,
  GENESIS_VAULT_ABI,
  REFERRAL_MANAGER_ABI,
  ERC20_ABI,
} from "../utils/contracts";

// Hook for NFT operations — unchanged API
export function useLimitlessNFT() {
  const { address } = useAccount();
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

  // Stats: [backing, distributed, claimed, redeemed, redeemedUSDT, floorPrice, activeNFTs, vaultTokenBalance, dailyReward]
  const stats = vaultStats as
    | [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]
    | undefined;

  return {
    totalBacking: stats ? formatEther(stats[0]) : "0",
    totalDistributed: stats ? formatEther(stats[1]) : "0",
    totalClaimed: stats ? formatEther(stats[2]) : "0",
    totalRedeemed: stats ? formatEther(stats[3]) : "0",
    totalRedeemedUSDT: stats ? formatEther(stats[4]) : "0",
    floorPrice: floorPriceRaw
      ? formatEther(floorPriceRaw as bigint)
      : stats
        ? formatEther(stats[5])
        : "0",
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
  const { data: historyLength } = useReadContract({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "getHistoryLength",
  });

  const { data: snapshots, isLoading, refetch } = useReadContract({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "getRecentSnapshots",
    args: [BigInt(snapshotCount)],
  });

  const chartData = snapshots
    ? (snapshots as Array<{
        timestamp: bigint;
        totalBacking: bigint;
        totalDistributed: bigint;
        floorPrice: bigint;
        activeNFTs: bigint;
      }>).map((snapshot) => ({
        timestamp: Number(snapshot.timestamp) * 1000,
        date: new Date(Number(snapshot.timestamp) * 1000).toLocaleDateString(),
        totalBacking: parseFloat(formatEther(snapshot.totalBacking)),
        totalDistributed: parseFloat(formatEther(snapshot.totalDistributed)),
        floorPrice: parseFloat(formatEther(snapshot.floorPrice)),
        activeNFTs: Number(snapshot.activeNFTs),
      }))
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
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [realtimePending, setRealtimePending] = useState("0");

  // Build multicall contract reads for getNFTInfo per tokenId
  const nftInfoContracts = (tokenIds || []).map((tokenId) => ({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "getNFTInfo" as const,
    args: [tokenId],
  }));

  // Build multicall contract reads for calculatePending per tokenId
  const pendingContracts = (tokenIds || []).map((tokenId) => ({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "calculatePending" as const,
    args: [tokenId],
  }));

  // Build multicall for liquidity values
  const liquidityContracts = (tokenIds || []).map((tokenId) => ({
    address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
    abi: GENESIS_VAULT_ABI,
    functionName: "getNFTLiquidityValue" as const,
    args: [tokenId],
  }));

  const { data: nftInfoResults, refetch: refetchInfo } = useReadContracts({
    contracts: nftInfoContracts,
    query: { enabled: (tokenIds || []).length > 0 },
  });

  const { data: pendingResults, refetch: refetchPending } = useReadContracts({
    contracts: pendingContracts,
    query: { enabled: (tokenIds || []).length > 0 },
  });

  const { data: liquidityResults, refetch: refetchLiquidity } =
    useReadContracts({
      contracts: liquidityContracts,
      query: { enabled: (tokenIds || []).length > 0 },
    });

  // Read wallet token balance
  const { data: walletBalance } = useReadContract({
    address: CONTRACTS.LIMITLESS_TOKEN as `0x${string}`,
    abi: LIMITLESS_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Build NFT data array
  const nfts = (tokenIds || []).map((tokenId, i) => {
    const infoResult = nftInfoResults?.[i];
    const pendingResult = pendingResults?.[i];
    const liquidityResult = liquidityResults?.[i];

    const info =
      infoResult?.status === "success"
        ? (infoResult.result as [bigint, bigint, bigint, bigint, boolean])
        : undefined;
    const pending =
      pendingResult?.status === "success"
        ? (pendingResult.result as bigint)
        : BigInt(0);
    const liquidityValue =
      liquidityResult?.status === "success"
        ? (liquidityResult.result as bigint)
        : BigInt(0);

    return {
      tokenId: Number(tokenId),
      tokenBalance: info ? formatEther(info[0]) : "0",
      tokenBalanceRaw: info ? info[0] : BigInt(0),
      pending: formatEther(pending),
      pendingRaw: pending,
      totalEarned: info ? formatEther(info[1]) : "0",
      totalClaimed: info ? formatEther(info[2]) : "0",
      totalRedeemed: info ? formatEther(info[3]) : "0",
      liquidityValue: formatEther(liquidityValue),
      isActive: info ? info[4] : false,
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

  // Real-time pending ticker (increment based on NFT count)
  const nftCount = nfts.filter((n) => n.isActive).length;
  const calculateRealtime = useCallback(() => {
    if (nftCount === 0) {
      setRealtimePending("0");
      return;
    }
    // Add a tiny increment per second for visual ticker effect
    const perSecond = nftCount / 86400;
    setRealtimePending((prev) => {
      const current = parseFloat(prev) || totalPending;
      return (current + perSecond).toFixed(6);
    });
  }, [nftCount, totalPending]);

  useEffect(() => {
    setRealtimePending(totalPending.toFixed(6));
  }, [totalPending]);

  useEffect(() => {
    const interval = setInterval(calculateRealtime, 1000);
    return () => clearInterval(interval);
  }, [calculateRealtime]);

  // Auto-refresh contract data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchInfo();
      refetchPending();
      refetchLiquidity();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchInfo, refetchPending, refetchLiquidity]);

  const distribute = async (tokenId: bigint) => {
    writeContract({
      address: CONTRACTS.GENESIS_VAULT as `0x${string}`,
      abi: GENESIS_VAULT_ABI,
      functionName: "distributeToNFT",
      args: [tokenId],
    });
  };

  const refetch = useCallback(async () => {
    await Promise.all([refetchInfo(), refetchPending(), refetchLiquidity()]);
  }, [refetchInfo, refetchPending, refetchLiquidity]);

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

// Hook for Referral operations — unchanged
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

// Hook for USDT approval — unchanged
export function useStablecoin() {
  const { address, isConnected, chain } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

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
