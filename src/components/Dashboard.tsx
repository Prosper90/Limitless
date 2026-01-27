import React from "react";
import { Link } from "react-router-dom";
import {
  useLimitlessNFT,
  useBuybackPool,
  useLimitlessRewards,
  useReferralManager,
} from "../hooks/useLimitless";
import { TokenPriceChart } from "./TokenPriceChart";

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
}) => (
  <div className="nerko-card hover-lift">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-2">{title}</p>
        <p
          className={`text-3xl font-bold ${gradient ? "gradient-text" : "text-white"}`}
        >
          {value}
        </p>
        {subtitle && <p className="text-gray-500 text-xs mt-2">{subtitle}</p>}
      </div>
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 flex items-center justify-center text-purple-400">
          {icon}
        </div>
      )}
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { totalMinted, userNFTBalance } = useLimitlessNFT();
  const { totalUsdtSpent, tokenPrice } = useBuybackPool();
  const { pendingRewards } = useLimitlessRewards();
  const { totalTeamSize, totalEarned } = useReferralManager();

  // Format large numbers
  const formatNumber = (num: string) => {
    const n = parseFloat(num);
    if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
    return n.toFixed(2);
  };

  const formatUSD = (num: string) => {
    return "$" + formatNumber(num);
  };

  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="mb-10">
        <span className="badge badge-primary mb-3">Dashboard</span>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome to <span className="gradient-text">LIMITLESS</span>
        </h1>
        <p className="text-gray-400">
          Track your earnings and platform statistics
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Link to="/buy" className="nerko-card hover-lift group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg group-hover:text-purple-400 transition-colors">
                Buy NFT
              </h3>
              <p className="text-gray-400 text-sm">Get lifetime rewards</p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>

        <Link
          to="/tokens"
          className="nerko-card hover-lift group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center">
              <svg
                className="w-7 h-7"
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
            <div className="flex-1">
              <h3 className="font-bold text-lg group-hover:text-green-400 transition-colors">
                My Rewards
              </h3>
              <p className="text-gray-400 text-sm">
                +{formatNumber(pendingRewards)} accruing
              </p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>

        <Link to="/team" className="nerko-card hover-lift group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <svg
                className="w-7 h-7"
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
            <div className="flex-1">
              <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">
                My Team
              </h3>
              <p className="text-gray-400 text-sm">{totalTeamSize} members</p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>
      </div>

      {/* Your Statistics */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></span>
          Your Statistics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Your NFTs"
            value={userNFTBalance}
            subtitle="NFTs owned"
            gradient
            icon={
              <svg
                className="w-6 h-6"
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
            }
          />
          <StatCard
            title="Token Balance"
            value={formatNumber(pendingRewards)}
            subtitle="Accrued LIMITLESS tokens"
            gradient={parseFloat(pendingRewards) > 0}
            icon={
              <svg
                className="w-6 h-6"
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
            }
          />
          <StatCard
            title="Daily Earning"
            value={"+" + userNFTBalance + "/day"}
            subtitle="Based on your NFTs"
            gradient={parseInt(userNFTBalance) > 0}
            icon={
              <svg
                className="w-6 h-6"
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
            }
          />
          <StatCard
            title="Referral Earnings"
            value={formatUSD(totalEarned)}
            subtitle="Total commission"
            icon={
              <svg
                className="w-6 h-6"
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
            }
          />
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full"></span>
          Platform Statistics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total NFTs Sold"
            value={totalMinted}
            subtitle="LIMITLESS NFTs minted"
          />
          <StatCard
            title="Total Accrued"
            value={formatNumber(pendingRewards)}
            subtitle="Tokens accrued ecosystem-wide"
          />
          <StatCard
            title="Total Buyback Volume"
            value={formatUSD(totalUsdtSpent)}
            subtitle="USDT spent on buybacks"
            gradient
          />
          <StatCard
            title="Token Price"
            value={formatUSD(tokenPrice)}
            subtitle="Current DEX price"
          />
        </div>
      </section>

      {/* Price Chart */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></span>
          Analytics
        </h2>
        <TokenPriceChart />
      </section>

      {/* How It Works */}
      <section className="nerko-card">
        <h2 className="text-xl font-bold mb-6">How LIMITLESS Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 flex items-center justify-center text-purple-400 shrink-0">
              <span className="font-bold">1</span>
            </div>
            <div>
              <h3 className="font-bold mb-2">Purchase NFT</h3>
              <p className="text-gray-400 text-sm">
                Buy a LIMITLESS NFT for $100 USDT. $25 goes to buyback, increasing token price.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 flex items-center justify-center text-purple-400 shrink-0">
              <span className="font-bold">2</span>
            </div>
            <div>
              <h3 className="font-bold mb-2">Earn Daily</h3>
              <p className="text-gray-400 text-sm">
                Receive 1 LIMITLESS token per NFT per day. Multiple NFTs = more
                rewards.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 flex items-center justify-center text-purple-400 shrink-0">
              <span className="font-bold">3</span>
            </div>
            <div>
              <h3 className="font-bold mb-2">Redeem Anytime</h3>
              <p className="text-gray-400 text-sm">
                Sell your tokens on PancakeSwap at market price to get USDT.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
