import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useLimitlessNFT, useStablecoin } from "../hooks/useLimitless";

export const BuyNFT: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { address } = useAccount();
  const [referrer, setReferrer] = useState("");
  const [step, setStep] = useState<"approve" | "mint">("approve");
  const [copied, setCopied] = useState(false);

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
  } = useStablecoin();

  // Check for referrer in URL
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ref.startsWith("0x") && ref.length === 42) {
      setReferrer(ref);
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

  // Refetch allowance after approval
  useEffect(() => {
    if (approveSuccess) {
      refetchAllowance();
    }
  }, [approveSuccess, refetchAllowance]);

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
            {/* Payment Distribution */}
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Payment Distribution
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center mb-3">
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">Liquidity Pool</p>
                  <p className="text-xl font-bold">$25</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center mb-3">
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">Referral Commissions</p>
                  <p className="text-xl font-bold">$25</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center mb-3">
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
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">R&D Development</p>
                  <p className="text-xl font-bold">$25</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center mb-3">
                    <svg
                      className="w-5 h-5 text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">CEO Wallets</p>
                  <p className="text-xl font-bold">$25</p>
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
                <div className="mt-4 p-4 bg-green-600/20 border border-green-600/30 rounded-xl text-center">
                  <svg
                    className="w-12 h-12 mx-auto text-green-400 mb-3"
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
                  <p className="text-green-400 font-bold text-lg">
                    NFT Purchased Successfully!
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    You will now earn 1 LIMITLESS token per day
                  </p>
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
