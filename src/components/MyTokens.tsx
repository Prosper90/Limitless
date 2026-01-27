import React, { useState } from "react";
import {
  useLimitlessToken,
  useLimitlessRewards,
  useBuybackPool,
  useClaimAndRedeem,
} from "../hooks/useLimitless";

export const MyTokens: React.FC = () => {
  const [redeemAmount, setRedeemAmount] = useState("");

  const { tokenBalance, refetchBalance } = useLimitlessToken();
  const { pendingRewards, nftCount, totalClaimed, lastClaimTime } =
    useLimitlessRewards();
  const { tokenPrice, minRedemption, totalUsdtSpent } = useBuybackPool();
  const {
    claimAndRedeem,
    hasPendingRewards,
    isPending: isRedeemPending,
    isConfirming: isRedeemConfirming,
    isSuccess: redeemSuccess,
    error: redeemError,
  } = useClaimAndRedeem();

  const handleRedeem = async () => {
    if (!redeemAmount || parseFloat(redeemAmount) <= 0) return;
    await claimAndRedeem(redeemAmount, () => {
      // Refetch balance after claim completes
      refetchBalance();
    });
    refetchBalance();
    setRedeemAmount("");
  };

  const handleMaxRedeem = () => {
    setRedeemAmount(totalAvailable.toString());
  };

  // Calculate estimated redemption value
  const estimatedRedemption = () => {
    if (!redeemAmount || parseFloat(redeemAmount) <= 0) return "0";
    const amount = parseFloat(redeemAmount);
    const price = parseFloat(tokenPrice);
    return (amount * price).toFixed(6);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const isRedeemLoading = isRedeemPending || isRedeemConfirming;
  // Calculate total available (balance + pending rewards)
  const totalAvailable = parseFloat(tokenBalance) + parseFloat(pendingRewards);
  const canRedeem =
    parseFloat(redeemAmount) >= parseFloat(minRedemption) &&
    parseFloat(redeemAmount) <= totalAvailable;

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
            Your tokens grow daily. Redeem anytime for USDT.
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
                <span className="font-medium">
                  {parseFloat(tokenBalance).toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Accruing Rewards</span>
                <span className="font-medium text-green-400">
                  +{parseFloat(pendingRewards).toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/10 pt-3">
                <span className="text-gray-400">Total Value</span>
                <span className="font-bold text-green-400">
                  ${(totalAvailable * parseFloat(tokenPrice)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Rewards Info */}
          <div className="nerko-card">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-bold text-lg">Daily Awards</h2>
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Your NFTs</span>
                <span className="font-bold text-xl">{nftCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Daily Earning Rate</span>
                <span className="font-medium text-green-400">
                  {nftCount} tokens/day
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Claimed</span>
                <span className="font-medium">
                  {parseFloat(totalClaimed).toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Claim</span>
                <span className="font-medium text-xs">
                  {formatDate(lastClaimTime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Redeem Tokens Section */}
        <div className="nerko-card mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-bold text-xl mb-1">Redeem Tokens for USDT</h2>
              <p className="text-gray-400 text-sm">
                Sell tokens on PancakeSwap at current market price
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
                Minimum: {minRedemption} tokens | Available:{" "}
                {totalAvailable.toFixed(4)} tokens
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
                    <span className="text-gray-400">Estimated USDT</span>
                    <span className="font-bold text-2xl text-green-400">
                      ~${estimatedRedemption()} USDT
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Current DEX Price</span>
                  <span className="text-gray-400">
                    1 LIMITLESS = ${parseFloat(tokenPrice).toFixed(6)} USDT
                  </span>
                </div>
                <p className="text-gray-500 text-xs">
                  Final amount may vary due to DEX slippage (max 5%)
                </p>
              </div>
            )}

            {/* Redeem Button */}
            <button
              onClick={handleRedeem}
              disabled={!canRedeem || isRedeemLoading}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-teal-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isRedeemLoading ? (
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
                  Redeem for USDT
                </span>
              )}
            </button>

            {hasPendingRewards && parseFloat(redeemAmount) > 0 && (
              <p className="text-gray-500 text-xs text-center">
                Your pending rewards will be automatically claimed before
                redeeming.
              </p>
            )}

            {redeemSuccess && (
              <div className="p-4 bg-green-600/20 border border-green-600/30 rounded-xl text-center">
                <p className="text-green-400 font-semibold">
                  Tokens redeemed successfully! USDT sent to your wallet.
                </p>
              </div>
            )}

            {redeemError && (
              <div className="p-4 bg-red-600/20 border border-red-600/30 rounded-xl text-center">
                <p className="text-red-400 font-semibold">Transaction failed</p>
                <p className="text-gray-400 text-sm mt-1">
                  {redeemError.message}
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
              <p className="text-gray-400 text-sm mb-1">Total Buyback Volume</p>
              <p className="text-2xl font-bold gradient-text">
                ${parseFloat(totalUsdtSpent).toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-gray-400 text-sm mb-1">DEX Token Price</p>
              <p className="text-2xl font-bold">
                ${parseFloat(tokenPrice).toFixed(6)}
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-4 text-center">
            Price determined by PancakeSwap DEX liquidity pool
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyTokens;
