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
    <div className="xl:col-span-4 bg-elevated rounded-xl p-5 border border-border-subtle shadow-[var(--shadow-card)]">
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
        {/* Donut */}
        <div className="relative flex-shrink-0">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={84}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={<FunnelTooltip />}
                offset={12}
                isAnimationActive={false}
                wrapperStyle={{ pointerEvents: "none" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold data-mono text-text-primary leading-none">
              {totalLeads.toLocaleString()}
            </span>
            <span className="text-[11px] mt-0.5 text-text-muted">
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
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--border-subtle)" }}
                >
                  <div
                    className="funnel-bar h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: item.color,
                      opacity: 0.85,
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
