import React, { useState } from "react";
import {
  useLimitlessNFT,
  useLimitlessToken,
  useNFTRewards,
  useGenesisVault,
  useVaultActions,
} from "../hooks/useLimitless";

type RedeemMode = "fromNFT" | "fromWallet";

export const MyTokens: React.FC = () => {
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemMode, setRedeemMode] = useState<RedeemMode>("fromNFT");
  const [selectedNFT, setSelectedNFT] = useState<number | null>(null);
  // const [claimAmount, setClaimAmount] = useState("");
  // const [claimNFT, setClaimNFT] = useState<number | null>(null);

  const { userTokens, userNFTBalance } = useLimitlessNFT();
  const { tokenBalance, refetchBalance } = useLimitlessToken();
  const { floorPrice, minRedemption, totalBacking } = useGenesisVault();
  const nftRewards = useNFTRewards(userTokens);
  const {
    //claimTokens,
    redeemFromNFT,
    redeemFromWallet,
    approveTokenForVault,
    tokenAllowance,
    refetchAllowance,
    isPending: isActionPending,
    isConfirming: isActionConfirming,
    isSuccess: actionSuccess,
    isApproveSuccess,
    error: actionError,
  } = useVaultActions();

  // Total available = wallet + all NFT balances + all pending
  const walletBal = parseFloat(tokenBalance);
  const nftTokenTotal = parseFloat(nftRewards.totalTokenBalance);
  const pendingTotal = parseFloat(nftRewards.realtimePending);
  const totalAvailable = walletBal + nftTokenTotal + pendingTotal;

  const handleRedeem = async () => {
    if (!redeemAmount || parseFloat(redeemAmount) <= 0) return;

    if (redeemMode === "fromNFT") {
      if (selectedNFT === null) return;
      await redeemFromNFT(BigInt(selectedNFT), redeemAmount);
    } else {
      // Check allowance for wallet redemption
      if (parseFloat(tokenAllowance) < parseFloat(redeemAmount)) {
        await approveTokenForVault(redeemAmount);
        return;
      }
      await redeemFromWallet(redeemAmount);
    }
    refetchBalance();
    nftRewards.refetch();
    setRedeemAmount("");
  };

  // const handleClaim = async () => {
  //   if (!claimAmount || parseFloat(claimAmount) <= 0 || claimNFT === null)
  //     return;
  //   await claimTokens(BigInt(claimNFT), claimAmount);
  //   refetchBalance();
  //   nftRewards.refetch();
  //   setClaimAmount("");
  // };

  // Refetch allowance after approval
  React.useEffect(() => {
    if (isApproveSuccess) {
      const timer = setTimeout(() => refetchAllowance(), 1000);
      return () => clearTimeout(timer);
    }
  }, [isApproveSuccess, refetchAllowance]);

  const handleMaxRedeem = () => {
    if (redeemMode === "fromNFT" && selectedNFT !== null) {
      const nft = nftRewards.nfts.find((n) => n.tokenId === selectedNFT);
      if (nft) setRedeemAmount(nft.tokenBalance);
    } else if (redeemMode === "fromWallet") {
      setRedeemAmount(tokenBalance);
    }
  };

  // const handleMaxClaim = () => {
  //   if (claimNFT !== null) {
  //     const nft = nftRewards.nfts.find((n) => n.tokenId === claimNFT);
  //     if (nft) setClaimAmount(nft.tokenBalance);
  //   }
  // };

  const estimatedRedemption = () => {
    if (!redeemAmount || parseFloat(redeemAmount) <= 0) return "0";
    const amount = parseFloat(redeemAmount);
    const price = parseFloat(floorPrice);
    return (amount * price).toFixed(6);
  };

  const isLoading = isActionPending || isActionConfirming;

  const canRedeem =
    parseFloat(redeemAmount) >= parseFloat(minRedemption) &&
    ((redeemMode === "fromNFT" && selectedNFT !== null) ||
      redeemMode === "fromWallet");

  const needsApproval =
    redeemMode === "fromWallet" &&
    parseFloat(redeemAmount) > 0 &&
    parseFloat(tokenAllowance) < parseFloat(redeemAmount);

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-10">
          <span className="badge badge-primary mb-3">My Tokens</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Manage Your <span className="gradient-text">Tokens</span>
          </h1>
          <p className="text-gray-400">
            Your tokens grow daily. Redeem anytime for USDC at the guaranteed
            floor price.
          </p>
        </div>

        {/* Token Balance Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Total Available Balance */}
          <div className="nerko-card">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-bold text-lg">Total Available</h2>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold gradient-text mb-1">
              {totalAvailable.toFixed(4)}
            </div>
            <p className="text-gray-400 text-sm">LIMITLESS tokens</p>
            <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Wallet Balance</span>
                <span className="font-medium">{walletBal.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">NFT Token Balances</span>
                <span className="font-medium">{nftTokenTotal.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pending Rewards</span>
                <span className="font-medium text-green-400">
                  +{parseFloat(nftRewards.realtimePending).toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/10 pt-3">
                <span className="text-gray-400">Total Value</span>
                <span className="font-bold text-green-400">
                  ${(totalAvailable * parseFloat(floorPrice)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Your NFTs */}
          <div className="nerko-card">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-bold text-lg">Your NFTs</h2>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-600/20 to-teal-600/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">NFTs Owned</span>
                <span className="font-bold text-xl">{userNFTBalance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Daily Earning Rate</span>
                <span className="font-medium text-green-400">
                  {userNFTBalance} tokens/day
                </span>
              </div>
              {nftRewards.nfts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2 max-h-40 overflow-y-auto">
                  {nftRewards.nfts.map((nft) => (
                    <div
                      key={nft.tokenId}
                      className="flex justify-between items-center text-sm p-2 bg-white/5 rounded-lg"
                    >
                      <div>
                        <span className="font-medium">#{nft.tokenId}</span>
                        <span
                          className={`ml-2 text-xs ${nft.isActive ? "text-green-400" : "text-gray-500"}`}
                        >
                          {nft.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-300">
                          {parseFloat(nft.tokenBalance).toFixed(2)}
                        </span>
                        <span className="text-green-400 ml-2 text-xs">
                          +{parseFloat(nft.pending).toFixed(4)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Claim Tokens to Wallet 
        <div className="nerko-card mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-bold text-xl mb-1">Claim to Wallet</h2>
              <p className="text-gray-400 text-sm">
                Move tokens from your NFT to your wallet
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Select NFT
              </label>
              <select
                value={claimNFT ?? ""}
                onChange={(e) =>
                  setClaimNFT(e.target.value ? Number(e.target.value) : null)
                }
                className="nerko-input w-full"
              >
                <option value="">Choose an NFT...</option>
                {nftRewards.nfts.map((nft) => (
                  <option key={nft.tokenId} value={nft.tokenId}>
                    #{nft.tokenId} — Balance:{" "}
                    {parseFloat(nft.tokenBalance).toFixed(4)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Amount to Claim
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="0.0"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="nerko-input flex-1"
                />
                <button
                  onClick={handleMaxClaim}
                  className="btn btn-outline shrink-0"
                >
                  MAX
                </button>
              </div>
            </div>

            <button
              onClick={handleClaim}
              disabled={
                !claimAmount ||
                parseFloat(claimAmount) <= 0 ||
                claimNFT === null ||
                isLoading
              }
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Claim to Wallet"
              )}
            </button>
          </div>
        </div>
       */}

        {/* Redeem Tokens Section */}
        <div className="nerko-card mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-bold text-xl mb-1">Redeem Tokens for USDC</h2>
              <p className="text-gray-400 text-sm">
                Redeem at guaranteed floor price
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-600/20 to-teal-600/20 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-6">
            {/* Mode selector */}
            <div className="flex gap-3">
              <button
                onClick={() => setRedeemMode("fromNFT")}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  redeemMode === "fromNFT"
                    ? "bg-gradient-to-r from-green-600 to-teal-600 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                Redeem from NFT
              </button>
              {/* <button
                onClick={() => setRedeemMode("fromWallet")}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  redeemMode === "fromWallet"
                    ? "bg-gradient-to-r from-green-600 to-teal-600 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                Redeem from Wallet
              </button> */}
            </div>

            {/* NFT selector (only for fromNFT) */}
            {redeemMode === "fromNFT" && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Select NFT
                </label>
                <select
                  value={selectedNFT ?? ""}
                  onChange={(e) =>
                    setSelectedNFT(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="nerko-input w-full"
                >
                  <option value="">Choose an NFT...</option>
                  {nftRewards.nfts.map((nft) => (
                    <option key={nft.tokenId} value={nft.tokenId}>
                      #{nft.tokenId} — Balance:{" "}
                      {parseFloat(nft.tokenBalance).toFixed(4)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Amount to Redeem
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="0.0"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  className="nerko-input flex-1"
                />
                <button
                  onClick={handleMaxRedeem}
                  className="btn btn-outline shrink-0"
                >
                  MAX
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Minimum: {minRedemption} tokens
                {redeemMode === "fromWallet" &&
                  ` | Wallet: ${walletBal.toFixed(4)} tokens`}
              </p>
            </div>

            {/* Redemption Preview */}
            {parseFloat(redeemAmount) > 0 && (
              <div className="p-6 bg-white/5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">You Redeem</span>
                  <span className="font-bold text-xl">
                    {redeemAmount}{" "}
                    <span className="text-purple-400">LIMITLESS</span>
                  </span>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Estimated USDC</span>
                    <span className="font-bold text-2xl text-green-400">
                      ~${estimatedRedemption()} USDC
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Floor Price</span>
                  <span className="text-gray-400">
                    1 LIMITLESS = ${parseFloat(floorPrice).toFixed(6)} USDC
                  </span>
                </div>
                <p className="text-gray-500 text-xs">
                  Floor price guaranteed — no slippage
                </p>
              </div>
            )}

            {/* Redeem Button */}
            <button
              onClick={handleRedeem}
              disabled={!canRedeem || isLoading}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-teal-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : needsApproval ? (
                <span className="flex items-center justify-center gap-2">
                  Approve Token for Vault
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Redeem for USDC
                </span>
              )}
            </button>

            {actionSuccess && (
              <div className="p-4 bg-green-600/20 border border-green-600/30 rounded-xl text-center">
                <p className="text-green-400 font-semibold">
                  Transaction successful! USDC sent to your wallet.
                </p>
              </div>
            )}

            {actionError && (
              <div className="p-4 bg-red-600/20 border border-red-600/30 rounded-xl text-center">
                <p className="text-red-400 font-semibold">Transaction failed</p>
                <p className="text-gray-400 text-sm mt-1">
                  {actionError.message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Market Info */}
        <div className="nerko-card">
          <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            Market Info
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-gray-400 text-sm mb-1">Total Vault Backing</p>
              <p className="text-2xl font-bold gradient-text">
                ${parseFloat(totalBacking).toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-gray-400 text-sm mb-1">Floor Price</p>
              <p className="text-2xl font-bold">
                ${parseFloat(floorPrice).toFixed(6)}
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-4 text-center">
            Floor price = Total Backing / Total Distributed Tokens
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyTokens;
