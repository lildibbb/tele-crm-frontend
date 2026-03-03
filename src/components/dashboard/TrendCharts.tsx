"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Pulse } from "@phosphor-icons/react";
import {
  ChartTooltip,
  BarTooltip,
} from "@/components/dashboard/chart-tooltips";

// ── Types ──────────────────────────────────────────────────────
export interface TrendPoint {
  date: string;
  Leads: number;
  Confirmed: number;
}

export interface DepositPoint {
  label: string;
  Deposits: number;
}

interface TrendChartsProps {
  trendData: TrendPoint[];
  depositsData: DepositPoint[];
  avgDeposits: number;
  bestDeposits: number;
  periodLabel: string;
  labels: {
    acquisitionTitle: string;
    trendSubtitle: string;
  };
}

// ── Component ──────────────────────────────────────────────────
export const TrendCharts = React.memo(function TrendCharts({
  trendData,
  depositsData,
  avgDeposits,
  bestDeposits,
  periodLabel,
  labels,
}: TrendChartsProps) {
  return (
    <div className="page-section grid grid-cols-1 xl:grid-cols-5 gap-3 md:gap-4">
      {/* Area Chart — Lead Acquisition Trend */}
      <div className="xl:col-span-3 bg-elevated rounded-[20px] p-5 border border-border-subtle shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-sans font-semibold text-[15px] text-text-primary">
            {labels.acquisitionTitle}
          </h2>
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <Pulse size={13} weight="regular" />
            {periodLabel}
          </span>
        </div>
        <p className="text-xs font-sans mb-5 text-text-muted">
          {labels.trendSubtitle}
        </p>

        <ResponsiveContainer width="100%" height={160}>
          <AreaChart
            data={trendData}
            margin={{ top: 0, right: 0, left: -22, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4232D" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#C4232D" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradConf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3A0" stopOpacity={0.38} />
                <stop offset="95%" stopColor="#22D3A0" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{
                fontSize: 11,
                fill: "var(--text-muted)",
                fontFamily: "inherit",
              }}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis hide />
            <Tooltip
              content={<ChartTooltip />}
              offset={12}
              isAnimationActive={false}
              wrapperStyle={{ pointerEvents: "none" }}
            />
            <Area
              type="monotone"
              dataKey="Leads"
              stroke="#C4232D"
              strokeWidth={2}
              fill="url(#gradLeads)"
            />
            <Area
              type="monotone"
              dataKey="Confirmed"
              stroke="#22D3A0"
              strokeWidth={2}
              fill="url(#gradConf)"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-5 mt-4 pt-3.5 border-t border-border-subtle">
          {(
            [
              ["#C4232D", "Leads"],
              ["#22D3A0", "Confirmed"],
            ] as const
          ).map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: color }}
              />
              <span className="text-[11px] text-text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart — Deposits Trend */}
      <div className="xl:col-span-2 bg-elevated rounded-[20px] p-5 border border-border-subtle shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-sans font-semibold text-[15px] text-text-primary">
            Deposits Trend
          </h2>
          <span className="text-xs font-sans text-text-muted">Count</span>
        </div>
        <p className="text-xs font-sans mb-5 text-text-muted">
          Confirmed deposits per period
        </p>

        <ResponsiveContainer width="100%" height={148}>
          <BarChart
            data={depositsData}
            margin={{ top: 0, right: 0, left: -22, bottom: 0 }}
            maxBarSize={32}
          >
            <defs>
              <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8B94F" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#E8B94F" stopOpacity={0.25} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{
                fontSize: 11,
                fill: "var(--text-muted)",
                fontFamily: "inherit",
              }}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis hide />
            <Tooltip
              content={<BarTooltip />}
              offset={12}
              isAnimationActive={false}
              wrapperStyle={{ pointerEvents: "none" }}
            />
            <Bar
              dataKey="Deposits"
              fill="url(#gradBar)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 pt-3.5 border-t border-border-subtle flex items-center justify-between">
          <div>
            <p className="text-[11px] text-text-muted">Average</p>
            <p className="data-mono text-xl text-gold leading-tight">
              {avgDeposits}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-text-muted">Best</p>
            <p className="data-mono text-xl text-text-primary leading-tight">
              {bestDeposits}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
