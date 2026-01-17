import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useReferralManager } from "../hooks/useLimitless";

export const MyTeam: React.FC = () => {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const {
    isRegistered,
    referrer,
    directReferrals,
    totalTeamSize,
    totalEarned,
    teamByLevels,
    commissionCount
  } = useReferralManager();

  // Commission amounts per level
  const commissionAmounts = ["$10", "$5", "$4", "$3", "$2", "$1"];
  const levelNames = ["Level 1 (Direct)", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6"];
  const levelColors = [
    "from-purple-600 to-pink-600",
    "from-blue-600 to-cyan-600",
    "from-green-600 to-teal-600",
    "from-yellow-600 to-orange-600",
    "from-orange-600 to-red-600",
    "from-red-600 to-pink-600"
  ];

  // Generate referral link
  const referralLink = address ? `${window.location.origin}/buy?ref=${address}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortenAddress = (addr: string) => {
    if (!addr || addr === "0x0000000000000000000000000000000000000000") return "None";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-10">
          <span className="badge badge-primary mb-3">My Team</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Build Your <span className="gradient-text">Network</span>
          </h1>
          <p className="text-gray-400">Track your referrals and commission earnings</p>
        </div>

        {/* Registration Status */}
        {!isRegistered && (
          <div className="nerko-card mb-8 border-yellow-600/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-600/20 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-lg text-yellow-400 mb-1">Not Registered Yet</h2>
                <p className="text-gray-400 text-sm">
                  You'll be automatically registered when you purchase your first NFT.
                  Once registered, you can start building your team and earning commissions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Referral Link */}
        <div className="nerko-card mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-bold text-lg mb-1">Your Referral Link</h2>
              <p className="text-gray-400 text-sm">Share this link to earn commissions</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
          </div>
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </span>
              )}
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-3">
            Share this link with friends. When they purchase NFTs using your link, you earn commissions up to 6 levels deep!
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="nerko-card hover-lift">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Direct Referrals</p>
            <p className="text-2xl font-bold gradient-text mt-1">{directReferrals}</p>
          </div>
          <div className="nerko-card hover-lift">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Total Team Size</p>
            <p className="text-2xl font-bold mt-1">{totalTeamSize}</p>
          </div>
          <div className="nerko-card hover-lift">
            <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Total Earned</p>
            <p className="text-2xl font-bold text-green-400 mt-1">${parseFloat(totalEarned).toFixed(2)}</p>
          </div>
          <div className="nerko-card hover-lift">
            <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Commission Txns</p>
            <p className="text-2xl font-bold mt-1">{commissionCount}</p>
          </div>
        </div>

        {/* Team by Levels */}
        <div className="nerko-card mb-8">
          <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Team by Level
          </h2>
          <div className="space-y-3">
            {levelNames.map((name, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${levelColors[index]} flex items-center justify-center text-lg font-bold`}>
                    L{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-gray-500 text-sm">Commission: {commissionAmounts[index]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{teamByLevels[index]}</p>
                  <p className="text-gray-500 text-sm">members</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commission Structure */}
        <div className="nerko-card mb-8">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Commission Structure
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Every time someone in your team purchases an NFT, $25 is distributed as referral commissions across 6 levels:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Level</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Relationship</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Commission</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium">Level 1</td>
                  <td className="py-3 px-4 text-gray-400">Direct Referral</td>
                  <td className="py-3 px-4 text-right font-bold text-green-400">$10</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium">Level 2</td>
                  <td className="py-3 px-4 text-gray-400">Referral's Referral</td>
                  <td className="py-3 px-4 text-right font-bold text-green-400">$5</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium">Level 3</td>
                  <td className="py-3 px-4 text-gray-400">3rd Generation</td>
                  <td className="py-3 px-4 text-right font-bold text-green-400">$4</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium">Level 4</td>
                  <td className="py-3 px-4 text-gray-400">4th Generation</td>
                  <td className="py-3 px-4 text-right font-bold text-green-400">$3</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium">Level 5</td>
                  <td className="py-3 px-4 text-gray-400">5th Generation</td>
                  <td className="py-3 px-4 text-right font-bold text-green-400">$2</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Level 6</td>
                  <td className="py-3 px-4 text-gray-400">6th Generation</td>
                  <td className="py-3 px-4 text-right font-bold text-green-400">$1</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10">
                  <td className="py-4 px-4 font-bold" colSpan={2}>Total Per Sale</td>
                  <td className="py-4 px-4 text-right font-bold text-2xl gradient-text">$25</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Referrer Info */}
        {isRegistered && (
          <div className="nerko-card">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Your Referrer
            </h2>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg">{shortenAddress(referrer || "")}</p>
                <p className="text-gray-500 text-sm">
                  {referrer === "0x0000000000000000000000000000000000000000" ? "You are a genesis user" : "Your upline"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeam;
