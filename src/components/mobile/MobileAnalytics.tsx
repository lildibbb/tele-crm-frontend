"use client";

import React, { useState } from "react";
import { ChartBar, Calendar } from "@phosphor-icons/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import MobileShell from "./MobileShell";
import { LiveDot } from "./MobileShell";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileAnalyticsProps {
  readonly role?: UserRole;
  readonly onMoreOpen?: () => void;
}

type DateRange = "Today" | "7D" | "30D" | "Custom";

// ── Mock data ──────────────────────────────────────────────────────────────────
const FLOW_DATA = [
  { day: "Mon", leads: 31, registered: 22, deposited: 8 },
  { day: "Tue", leads: 38, registered: 27, deposited: 11 },
  { day: "Wed", leads: 28, registered: 18, deposited: 6 },
  { day: "Thu", leads: 45, registered: 34, deposited: 14 },
  { day: "Fri", leads: 42, registered: 28, deposited: 11 },
  { day: "Sat", leads: 35, registered: 24, deposited: 9 },
  { day: "Sun", leads: 52, registered: 38, deposited: 16 },
];

const AUM_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  aum: 60000 + i * 1200 + Math.round(Math.random() * 8000),
}));

const FUNNEL_ITEMS = [
  { label: "Leads", count: 284, pct: 100, color: "#C4232D" },
  { label: "Registered", count: 184, pct: 65, color: "#60A5FA" },
  { label: "Deposited", count: 89, pct: 31, color: "#22D3A0" },
  { label: "FTD", count: 42, pct: 15, color: "#E8B94F" },
];

const TOP_PERFORMERS = [
  { rank: 1, name: "Ahmad Razali", leads: 89, color: "#E8B94F" },
  { rank: 2, name: "James Khoo", leads: 74, color: "#F0F0FF" },
  { rank: 3, name: "Sarah Ng", leads: 62, color: "#F0F0FF" },
  { rank: 4, name: "Liu Wei", leads: 55, color: "#F0F0FF" },
  { rank: 5, name: "Priya Menon", leads: 48, color: "#F0F0FF" },
];

const STAT_CHIPS = [
  { label: "New Leads", value: "42", color: "#C4232D" },
  { label: "Registered", value: "28", color: "#60A5FA" },
  { label: "FTD", value: "11", color: "#22D3A0" },
  { label: "AUM", value: "$84K", color: "#E8B94F" },
];

const DATE_RANGES: DateRange[] = ["Today", "7D", "30D", "Custom"];

// ── Section card wrapper ───────────────────────────────────────────────────────
function SectionCard({
  title,
  children,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="mx-4 mt-4 p-4 rounded-xl bg-[#141422] border border-[#2A2A42]">
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans font-semibold text-[14px] text-[#F0F0FF]">
          {title}
        </span>
        {badge}
      </div>
      {children}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileAnalytics({
  role = "OWNER",
  onMoreOpen,
}: MobileAnalyticsProps) {
  const [range, setRange] = useState<DateRange>("7D");

  return (
    <MobileShell
      role={role}
      activeTab="home"
      pageTitle="Analytics"
      notificationCount={0}
      verifyBadgeCount={0}
      userInitials="TJ"
      showLiveDot
      onTabChange={(tab) => tab === "more" && onMoreOpen?.()}
    >
      <div className="pb-6">
        {/* Date range control */}
        <div className="flex gap-2 px-4 pt-4">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "flex-1 h-9 rounded-full font-sans text-[13px] font-medium transition-colors",
                range === r
                  ? "bg-[#C4232D1A] text-[#C4232D]"
                  : "bg-[#141422] text-[#8888AA] border border-[#2A2A42]",
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Quick stat strip */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pt-4 pb-1">
          {STAT_CHIPS.map((chip) => (
            <div
              key={chip.label}
              className="shrink-0 flex flex-col gap-0.5 px-4 py-3 rounded-[10px] bg-[#141422] border border-[#2A2A42]"
            >
              <span
                className="font-display font-bold text-[20px]"
                style={{ color: chip.color }}
              >
                {chip.value}
              </span>
              <span className="font-sans text-[11px] text-[#8888AA]">
                {chip.label}
              </span>
            </div>
          ))}
        </div>

        {/* Lead Flow BarChart */}
        <SectionCard
          title="Lead Flow — 7 Days"
          badge={
            <span className="font-sans text-[12px] text-[#8888AA]">
              New vs Reg vs Dep
            </span>
          }
        >
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={FLOW_DATA}
              margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
            >
              <XAxis
                dataKey="day"
                tick={{
                  fill: "#555570",
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1C1C2E",
                  border: "1px solid #2A2A42",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "#8888AA", fontSize: 11 }}
                itemStyle={{ color: "#F0F0FF", fontSize: 12 }}
              />
              <Bar dataKey="leads" fill="#C4232D" radius={[3, 3, 0, 0]} />
              <Bar dataKey="registered" fill="#60A5FA" radius={[3, 3, 0, 0]} />
              <Bar dataKey="deposited" fill="#22D3A0" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Conversion Funnel */}
        <SectionCard title="Conversion Funnel">
          <div className="flex flex-col gap-3">
            {FUNNEL_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-[90px] shrink-0 font-sans text-[13px] text-[#F0F0FF]">
                  {item.label}:{" "}
                  <span className="text-[#8888AA]">{item.count}</span>
                </span>
                <div className="flex-1 h-[10px] rounded-full bg-[#1C1C2E] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.pct}%`, background: item.color }}
                  />
                </div>
                <span className="w-10 text-right font-sans text-[12px] text-[#8888AA]">
                  {item.pct}%
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* AUM Over Time */}
        <SectionCard
          title="AUM Balance"
          badge={
            <span
              className="rounded-full px-2 py-0.5 font-sans text-[11px] font-medium text-[#22D3A0]"
              style={{ background: "#22D3A022" }}
            >
              +20.1% this month
            </span>
          }
        >
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart
              data={AUM_DATA}
              margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8B94F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E8B94F" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  background: "#1C1C2E",
                  border: "1px solid #2A2A42",
                  borderRadius: 8,
                }}
                labelStyle={{ display: "none" }}
                itemStyle={{ color: "#E8B94F", fontSize: 12 }}
                formatter={(v: number | undefined) => [`$${((v ?? 0) / 1000).toFixed(0)}K`, "AUM"]}
              />
              <Area
                type="monotone"
                dataKey="aum"
                stroke="#E8B94F"
                strokeWidth={2}
                fill="url(#aumGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Top Performers (OWNER/SUPERADMIN only) */}
        {(role === "OWNER" || role === "SUPERADMIN" || role === "ADMIN") && (
          <SectionCard title="Top Staff by Leads">
            <div className="flex flex-col gap-3">
              {TOP_PERFORMERS.map((p) => (
                <div key={p.rank} className="flex items-center gap-3">
                  <span className="w-6 font-mono text-[14px] text-[#555570] text-right shrink-0">
                    {p.rank}
                  </span>
                  <span className="flex-1 font-sans font-semibold text-[14px] text-[#F0F0FF]">
                    {p.name}
                  </span>
                  <span
                    className="font-display font-bold text-[16px]"
                    style={{ color: "#C4232D" }}
                  >
                    {p.leads}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </MobileShell>
  );
}
