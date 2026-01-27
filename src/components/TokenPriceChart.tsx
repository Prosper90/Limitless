import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useBuybackPoolHistory } from "../hooks/useLimitless";

type ChartMetric = "tokenPrice" | "totalBought" | "poolBalance";

interface MetricConfig {
  key: ChartMetric;
  label: string;
  color: string;
  gradientId: string;
  format: (value: number) => string;
}

const metrics: MetricConfig[] = [
  {
    key: "tokenPrice",
    label: "Token Price",
    color: "#a855f7",
    gradientId: "colorPrice",
    format: (v) => `$${v.toFixed(4)}`,
  },
  {
    key: "totalBought",
    label: "Tokens Bought",
    color: "#22c55e",
    gradientId: "colorBought",
    format: (v) => (v >= 1000 ? (v / 1000).toFixed(1) + "K" : v.toFixed(2)),
  },
  {
    key: "poolBalance",
    label: "Pool Balance",
    color: "#3b82f6",
    gradientId: "colorBalance",
    format: (v) => (v >= 1000 ? (v / 1000).toFixed(1) + "K" : v.toFixed(0)),
  },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
  metric: MetricConfig;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  metric,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-white font-bold">{metric.format(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export const TokenPriceChart: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>("tokenPrice");
  const { chartData, isLoading, historyLength } = useBuybackPoolHistory(30);

  const currentMetric = metrics.find((m) => m.key === selectedMetric)!;

  // If no data, show placeholder
  if (isLoading) {
    return (
      <div className="nerko-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">Price Chart</h3>
            <p className="text-gray-400 text-sm">Loading historical data...</p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-400 animate-spin"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <span className="text-gray-400 text-sm">Loading chart...</span>
          </div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="nerko-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">Price Chart</h3>
            <p className="text-gray-400 text-sm">Historical token price data</p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-purple-400"
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
            </div>
            <p className="text-gray-400 text-sm">No historical data yet</p>
            <p className="text-gray-500 text-xs mt-1">
              Data will appear after NFT purchases
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nerko-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
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
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            {currentMetric.label} Chart
          </h3>
          <p className="text-gray-400 text-sm">
            {historyLength} data points available
          </p>
        </div>

        {/* Metric Selector */}
        <div className="flex gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedMetric === metric.key
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={currentMetric.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickFormatter={(value) => currentMetric.format(value)}
              width={70}
            />
            <Tooltip content={<CustomTooltip metric={currentMetric} />} />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={currentMetric.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${currentMetric.gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Current Value */}
      {chartData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-gray-400 text-sm">Current {currentMetric.label}</span>
          <span className="font-bold text-lg" style={{ color: currentMetric.color }}>
            {currentMetric.format(chartData[chartData.length - 1][selectedMetric])}
          </span>
        </div>
      )}
    </div>
  );
};

export default TokenPriceChart;
