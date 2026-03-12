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
  CartesianGrid,
  ReferenceLine,
  LabelList,
  ResponsiveContainer,
} from "recharts";
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

// ── Shared tooltip props (removes recharts' default white wrapper) ──
const tooltipWrapperProps = {
  contentStyle: {
    background: "transparent",
    border: "none",
    padding: 0,
    boxShadow: "none",
  },
  wrapperStyle: { pointerEvents: "none" as const, outline: "none" },
  isAnimationActive: false,
  offset: 14,
};

// ── Y-axis compact formatter ─────────────────────────────────────
const fmtTick = (v: number): string =>
  v >= 1_000_000
    ? (v / 1_000_000).toFixed(1).replace(".0", "") + "M"
    : v >= 1_000
      ? (v / 1_000).toFixed(1).replace(".0", "") + "K"
      : String(v);

// ── Live indicator ──────────────────────────────────────────────
function LiveDot({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-text-muted">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
      </span>
      {label}
    </span>
  );
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
      <div className="xl:col-span-3 relative overflow-hidden bg-elevated rounded-xl p-5 border border-border-subtle shadow-[var(--shadow-card)]">
        {/* Crimson top accent line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-crimson)]/50 to-transparent" />
        {/* Corner glow */}
        <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full bg-[var(--color-crimson)]/8 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-1">
          <h2 className="font-sans font-semibold text-[15px] text-text-primary">
            {labels.acquisitionTitle}
          </h2>
          <LiveDot label={periodLabel} />
        </div>
        <p className="text-xs font-sans mb-4 text-text-muted">
          {labels.trendSubtitle}
        </p>

        {/* Dark chart viewport */}
        <div className="rounded-xl overflow-hidden bg-[#0c0e12] px-1 pt-3 pb-1">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={trendData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="var(--color-crimson)" stopOpacity={0.72} />
                  <stop offset="45%"  stopColor="var(--color-crimson)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--color-crimson)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradConf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#22D3A0" stopOpacity={0.65} />
                  <stop offset="45%"  stopColor="#22D3A0" stopOpacity={0.20} />
                  <stop offset="100%" stopColor="#22D3A0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.40)", fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />
              <YAxis
                width={32}
                tickFormatter={fmtTick}
                tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)", fontFamily: "var(--font-jetbrains-mono,monospace)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 }}
                {...tooltipWrapperProps}
              />
              <Area
                animationDuration={900}
                animationEasing="ease-out"
                type="monotone"
                dataKey="Leads"
                stroke="var(--color-crimson)"
                strokeWidth={2}
                fill="url(#gradLeads)"
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: "#0c0e12",
                  fill: "var(--color-crimson)",
                  style: { filter: "drop-shadow(0 0 5px var(--color-crimson))" },
                }}
              />
              <Area
                animationDuration={1050}
                animationEasing="ease-out"
                type="monotone"
                dataKey="Confirmed"
                stroke="#22D3A0"
                strokeWidth={2}
                fill="url(#gradConf)"
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: "#0c0e12",
                  fill: "#22D3A0",
                  style: { filter: "drop-shadow(0 0 5px #22D3A0)" },
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-5 mt-4 pt-3.5 border-t border-border-subtle">
          {(
            [
              ["var(--color-crimson)", "Leads"],
              ["#22D3A0", "Confirmed"],
            ] as const
          ).map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <svg width="18" height="8" viewBox="0 0 18 8" fill="none">
                <line x1="0" y1="4" x2="18" y2="4" stroke={color} strokeWidth="1.5" strokeDasharray="0" />
                <circle cx="9" cy="4" r="2.5" fill={color} />
              </svg>
              <span className="text-[11px] text-text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart — Deposits Trend */}
      <div className="xl:col-span-2 relative overflow-hidden bg-elevated rounded-xl p-5 border border-border-subtle shadow-[var(--shadow-card)]">
        {/* Gold top accent line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E8B94F]/60 to-transparent" />
        {/* Corner glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#E8B94F]/6 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-1">
          <h2 className="font-sans font-semibold text-[15px] text-text-primary">
            Deposits Trend
          </h2>
          <span className="text-xs font-sans text-text-muted px-2 py-0.5 rounded-full bg-border-subtle/40">
            Count
          </span>
        </div>
        <p className="text-xs font-sans mb-4 text-text-muted">
          Confirmed deposits per period
        </p>

        {/* Dark chart viewport */}
        <div className="rounded-xl overflow-hidden bg-[#0c0e12] px-1 pt-3 pb-1">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              data={depositsData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              maxBarSize={32}
            >
              <defs>
                <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#E8B94F" stopOpacity={0.95} />
                  <stop offset="60%"  stopColor="#E8B94F" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#E8B94F" stopOpacity={0.15} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.40)", fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />
              <YAxis
                width={30}
                tickFormatter={fmtTick}
                tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)", fontFamily: "var(--font-jetbrains-mono,monospace)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<BarTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.05)", rx: 6 }}
                {...tooltipWrapperProps}
              />
              {avgDeposits > 0 && (
                <ReferenceLine
                  y={avgDeposits}
                  stroke="rgba(232,185,79,0.45)"
                  strokeDasharray="5 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Avg ${fmtTick(avgDeposits)}`,
                    position: "insideTopRight",
                    fontSize: 9,
                    fill: "rgba(232,185,79,0.65)",
                    fontFamily: "var(--font-jetbrains-mono,monospace)",
                  }}
                />
              )}
              <Bar
                animationDuration={700}
                animationEasing="ease-out"
                dataKey="Deposits"
                fill="url(#gradBar)"
                radius={[8, 8, 0, 0]}
              >
                <LabelList
                  dataKey="Deposits"
                  position="top"
                  style={{
                    fontSize: 9,
                    fill: "rgba(255,255,255,0.55)",
                    fontFamily: "var(--font-jetbrains-mono,monospace)",
                  }}
                  formatter={(v: unknown) => (typeof v === 'number' && v > 0 ? fmtTick(v) : "")}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

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
