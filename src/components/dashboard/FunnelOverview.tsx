"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { FunnelTooltip } from "@/components/dashboard/chart-tooltips";

// ── Types ──────────────────────────────────────────────────────
export interface FunnelItem {
  name: string;
  value: number;
  color: string;
}

interface FunnelOverviewProps {
  data: FunnelItem[];
  totalLeads: number;
  period: string;
  labels: {
    title: string;
    subtitle: string;
    totalLeads: string;
    periodLabel: string;
  };
}

// ── Component ──────────────────────────────────────────────────
export const FunnelOverview = React.memo(function FunnelOverview({
  data,
  totalLeads,
  labels,
}: FunnelOverviewProps) {
  return (
    <div className="xl:col-span-4 relative overflow-hidden bg-elevated rounded-xl p-5 border border-border-subtle shadow-[var(--shadow-card)]">
      {/* Crimson top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-crimson)]/40 to-transparent" />
      {/* Corner glow */}
      <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full bg-[var(--color-crimson)]/6 blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-1">
        <h2 className="font-sans font-semibold text-[15px] text-text-primary">
          {labels.title}
        </h2>
        <span className="text-xs font-sans text-text-muted">
          {labels.periodLabel}
        </span>
      </div>
      <p className="text-xs font-sans mb-5 text-text-muted">
        {labels.subtitle}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
        {/* Donut — dark viewport */}
        <div className="relative flex-shrink-0 rounded-full bg-[#0c0e12] p-1">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                stroke="#0c0e12"
                strokeWidth={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={<FunnelTooltip />}
                contentStyle={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  boxShadow: "none",
                }}
                wrapperStyle={{ pointerEvents: "none", outline: "none" }}
                isAnimationActive={false}
                offset={14}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label with glow ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Subtle inner ring */}
            <div
              className="absolute rounded-full border border-white/[0.06]"
              style={{
                width: 118,
                height: 118,
                boxShadow:
                  "0 0 20px rgba(34,211,160,0.10), inset 0 0 16px rgba(34,211,160,0.06)",
              }}
            />
            <span className="text-2xl font-bold data-mono text-white leading-none relative z-10">
              {totalLeads.toLocaleString()}
            </span>
            <span className="text-[11px] mt-0.5 text-white/50 relative z-10">
              {labels.totalLeads}
            </span>
          </div>
        </div>

        {/* Stats list */}
        <div className="flex-1 space-y-3.5 w-full">
          {data.map((item) => {
            const pct =
              totalLeads > 0 ? Math.round((item.value / totalLeads) * 100) : 0;
            return (
              <div key={item.name}>
                <div className="flex items-center gap-3 mb-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: item.color }}
                  />
                  <span className="text-[13px] font-sans flex-1 text-text-secondary">
                    {item.name}
                  </span>
                  <span className="data-mono text-[13px] text-text-primary">
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-[11px] w-9 text-right text-text-muted">
                    {pct}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "var(--border-subtle)" }}
                >
                  <div
                    className="funnel-bar h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: item.color,
                      opacity: 0.85,
                      transition: "width 600ms ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
