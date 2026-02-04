import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useLimitlessNFT, useStablecoin } from "../hooks/useLimitless";
import { CONTRACTS } from "../utils/contracts";
import { TokenPriceChart } from "./TokenPriceChart";

export const BuyNFT: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { address } = useAccount();
  const [referrer, setReferrer] = useState("");
  const [step, setStep] = useState<"approve" | "mint">("approve");
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 24, minutes: 0, seconds: 0 });

  const {
    nftPrice,
    mintNFT,
    isPending: isMinting,
    isConfirming: isConfirmingMint,
    isSuccess: mintSuccess,
    error: mintError,
  } = useLimitlessNFT();
  const {
    balance,
    allowance,
    symbol,
    approve,
    isPending: isApproving,
    isConfirming: isConfirmingApprove,
    isSuccess: approveSuccess,
    refetchAllowance,
    hash: approveHash,
  } = useStablecoin();

  // const {
  //   data: balanceUSDT,
  //   isLoading: balanceLoading,
  //   error: balanceError,
  // } = useTokenBalance(CONTRACTS.STABLECOIN as `0x${string}`, address);

  // Debug logging
  console.log("STABLECOIN Address:", CONTRACTS.STABLECOIN);
  console.log("User Address:", address);
  // console.log("Balance from useTokenBalance:", balanceUSDT?.toString());
  // console.log("Balance from useStablecoin:", balance);
  // console.log("Balance Loading:", balanceLoading);
  // console.log("Balance Error:", balanceError);

  // Check for referrer in URL or localStorage
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ref.startsWith("0x") && ref.length === 42) {
      setReferrer(ref);
      localStorage.setItem("limitless_referral", ref);
    } else {
      const storedRef = localStorage.getItem("limitless_referral");
      if (storedRef && storedRef.startsWith("0x") && storedRef.length === 42) {
        setReferrer(storedRef);
      }
    }
  }, [searchParams]);

  // Update step based on allowance
  useEffect(() => {
    const price = parseFloat(nftPrice);
    const currentAllowance = parseFloat(allowance);
    if (currentAllowance >= price) {
      setStep("mint");
    } else {
      setStep("approve");
    }
  }, [allowance, nftPrice]);

  // Refetch allowance after approval - use a ref to prevent multiple refetches
  const lastApproveHash = React.useRef<string | undefined>(undefined);
  useEffect(() => {
    if (
      approveSuccess &&
      approveHash &&
      approveHash !== lastApproveHash.current
    ) {
      lastApproveHash.current = approveHash;
      // Small delay to ensure blockchain state is updated
      const timer = setTimeout(() => {
        refetchAllowance();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [approveSuccess, approveHash, refetchAllowance]);

  // 24-hour countdown after successful purchase
  useEffect(() => {
    if (!mintSuccess) return;

    const purchaseTime = Date.now();
    const targetTime = purchaseTime + 24 * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = targetTime - now;

      if (remaining <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      setCountdown({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [mintSuccess]);

  const handleApprove = async () => {
    await approve(nftPrice);
  };

  const handleMint = async () => {
    const ref = referrer || "0x0000000000000000000000000000000000000000";
    await mintNFT(ref);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLoading =
    isMinting || isConfirmingMint || isApproving || isConfirmingApprove;
  const hasEnoughBalance = parseFloat(balance) >= parseFloat(nftPrice);

  // Generate referral link
  const referralLink = address
    ? `${window.location.origin}/buy?ref=${address}`
    : "";

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-10">
          <span className="badge badge-primary mb-3">Buy NFT</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Get Your <span className="gradient-text">LIMITLESS</span> NFT
          </h1>
          <p className="text-gray-400">
            Purchase an NFT to start earning 1 token per day forever
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - NFT Preview */}
          <div className="lg:col-span-2">
            <div className="nerko-card sticky top-28">
              <div className="relative rounded-2xl overflow-hidden mb-6">
                <img
                  src="/art_01.jpg"
                  alt="LIMITLESS NFT"
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="badge badge-success">Active</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">LIMITLESS NFT</h2>
              <p className="text-gray-400 text-sm mb-4">
                Each NFT entitles you to receive 1 LIMITLESS token per day,
                forever. No staking required.
              </p>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-gray-400 text-sm">Price</p>
                  <p className="text-3xl font-bold gradient-text">
                    ${nftPrice}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Your Balance</p>
                  <p className="text-xl font-bold">
                    {parseFloat(balance).toFixed(2)} {symbol}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Flow */}
          <div className="lg:col-span-3 space-y-6">
            {/* What You Get */}
            <div className="nerko-card">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                What You Get
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-white">1 Token Per Day, Forever</p>
                    <p className="text-gray-400 text-sm">Earn 1 LIMITLESS token every 24 hours just by holding your NFT</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-white">Guaranteed Floor Price</p>
                    <p className="text-gray-400 text-sm">Redeem your tokens anytime at the guaranteed floor price backed by the Genesis Vault</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-white">Referral Earnings</p>
                    <p className="text-gray-400 text-sm">Earn up to $25 per sale across 6 levels by sharing your referral link</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-white">Lifetime Ownership</p>
                    <p className="text-gray-400 text-sm">No staking, no locking, no expiry. Your NFT earns rewards as long as you hold it</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Referrer Input */}
            <div className="nerko-card">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Referrer Address
                <span className="text-gray-500 text-sm font-normal">
                  (Optional)
                </span>
              </h3>
              <input
                type="text"
                placeholder="0x..."
                value={referrer}
                onChange={(e) => setReferrer(e.target.value)}
                className="nerko-input"
              />
              <p className="text-gray-500 text-xs mt-3">
                If someone referred you, enter their wallet address to give them
                commission
              </p>
            </div>

            {/* Action Buttons */}
            <div className="nerko-card">
              {!hasEnoughBalance ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-600/20 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-red-400 font-semibold mb-2">
                    Insufficient {symbol} Balance
                  </p>
                  <p className="text-gray-400 text-sm">
                    You need at least ${nftPrice} {symbol} to purchase an NFT
                  </p>
                </div>
              ) : (
                <>
                  {/* Progress Steps */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`flex items-center gap-2 ${step === "approve" ? "text-purple-400" : "text-green-400"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "approve" ? "bg-purple-600" : "bg-green-600"}`}
                      >
                        {step === "mint" ? (
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <span>1</span>
                        )}
                      </div>
                      <span className="font-medium text-sm">Approve</span>
                    </div>
                    <div className="flex-1 h-1 bg-white/10 rounded">
                      <div
                        className={`h-full rounded transition-all ${step === "mint" ? "bg-green-600 w-full" : "bg-purple-600 w-0"}`}
                      />
                    </div>
                    <div
                      className={`flex items-center gap-2 ${step === "mint" ? "text-purple-400" : "text-gray-500"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "mint" ? "bg-purple-600" : "bg-white/10"}`}
                      >
                        <span>2</span>
                      </div>
                      <span className="font-medium text-sm">Purchase</span>
                    </div>
                  </div>

                  {step === "approve" ? (
                    <button
                      onClick={handleApprove}
                      disabled={isLoading}
                      className="btn btn-gradient w-full py-4"
                    >
                      {isApproving || isConfirmingApprove ? (
                        <span className="flex items-center gap-2">
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
                          Approving {symbol}...
                        </span>
                      ) : (
                        <span>Approve {symbol}</span>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleMint}
                      disabled={isLoading}
                      className="btn btn-gradient w-full py-4"
                    >
                      {isMinting || isConfirmingMint ? (
                        <span className="flex items-center gap-2">
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
                          Purchasing NFT...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Purchase NFT for ${nftPrice}
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
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  )}
                </>
              )}

              {mintSuccess && (
                <div className="mt-6 space-y-6">
                  {/* Success Banner */}
                  <div className="p-6 bg-green-600/20 border border-green-600/30 rounded-xl text-center">
                    <svg
                      className="w-16 h-16 mx-auto text-green-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-green-400 font-bold text-2xl mb-2">
                      NFT Purchased Successfully!
                    </p>

                    {/* Token Badge */}
                    <div className="inline-flex items-center gap-3 bg-white/10 rounded-full px-6 py-3 mt-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center font-bold text-lg">
                        1
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-white">LIMITLESS Token</p>
                        <p className="text-gray-400 text-xs">Earned per day, forever</p>
                      </div>
                    </div>
                  </div>

                  {/* 24-Hour Countdown */}
                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center">
                    <h3 className="font-bold text-lg mb-2">First Token In</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Your first LIMITLESS token accrues in:
                    </p>
                    <div className="flex justify-center gap-4">
                      <div className="bg-white/10 rounded-xl p-4 min-w-[80px]">
                        <p className="text-3xl font-bold gradient-text">
                          {String(countdown.hours).padStart(2, "0")}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">Hours</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 min-w-[80px]">
                        <p className="text-3xl font-bold gradient-text">
                          {String(countdown.minutes).padStart(2, "0")}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">Minutes</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 min-w-[80px]">
                        <p className="text-3xl font-bold gradient-text">
                          {String(countdown.seconds).padStart(2, "0")}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">Seconds</p>
                      </div>
                    </div>
                  </div>

                  {/* Embedded Price Chart */}
                  <TokenPriceChart />
                </div>
              )}

              {mintError && (
                <div className="mt-4 p-4 bg-red-600/20 border border-red-600/30 rounded-xl text-center">
                  <p className="text-red-400 font-semibold">
                    Transaction Failed
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {mintError.message}
                  </p>
                </div>
              )}
            </div>

            {/* Referral Link */}
            {address && (
              <div className="nerko-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Your Referral Link
                </h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="nerko-input flex-1 text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`btn ${copied ? "bg-green-600" : "btn-gradient"} shrink-0`}
                  >
                    {copied ? (
                      <span className="flex items-center gap-2">
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Copied!
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy
                      </span>
                    )}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-3">
                  Share this link to earn up to $25 commission per NFT sale (6
                  levels)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyNFT;
