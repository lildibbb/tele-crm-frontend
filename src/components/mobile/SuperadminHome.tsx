"use client";

import React from "react";
import {
  ChartBar,
  Users,
  CurrencyDollar,
  Pulse,
  WarningCircle,
  CheckCircle,
  ArrowRight,
} from "@phosphor-icons/react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import MobileShell, { LiveDot } from "./MobileShell";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface SuperadminHomeProps {
  readonly onMoreOpen?: () => void;
  readonly onOrgClick?: (orgId: string) => void;
}

interface StatChip {
  Icon: React.ElementType;
  iconBg: string;
  value: string;
  valueColor?: string;
  label: string;
}

interface OrgCard {
  id: string;
  initial: string;
  name: string;
  ownerName: string;
  leadCount: number;
  aum: string;
  isActive: boolean;
}

interface AlertItem {
  id: string;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const STAT_CHIPS: StatChip[] = [
  { Icon: ChartBar, iconBg: "#E8B94F22", value: "14", label: "Orgs" },
  { Icon: Users, iconBg: "#C4232D22", value: "8,421", label: "Total Leads" },
  {
    Icon: CurrencyDollar,
    iconBg: "#E8B94F22",
    value: "$2.1M",
    valueColor: "#E8B94F",
    label: "Platform AUM",
  },
  {
    Icon: Pulse,
    iconBg: "#22D3A022",
    value: "156",
    valueColor: "#22D3A0",
    label: "Active Today",
  },
];

const FUNNEL_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: i,
  leads: 200 + Math.round(Math.random() * 120),
  registered: 140 + Math.round(Math.random() * 80),
  ftd: 50 + Math.round(Math.random() * 40),
}));

const ORGS: OrgCard[] = [
  {
    id: "1",
    initial: "T",
    name: "Titan Journal Main",
    ownerName: "Alex Tan",
    leadCount: 1284,
    aum: "$425K",
    isActive: true,
  },
  {
    id: "2",
    initial: "F",
    name: "ForexPro Ventures",
    ownerName: "Raj Menon",
    leadCount: 892,
    aum: "$218K",
    isActive: true,
  },
  {
    id: "3",
    initial: "G",
    name: "GoldPath Capital",
    ownerName: "Lisa Wong",
    leadCount: 543,
    aum: "$97K",
    isActive: true,
  },
];

const ALERTS: AlertItem[] = [
  {
    id: "a1",
    Icon: WarningCircle,
    iconColor: "#F59E0B",
    iconBg: "#F59E0B22",
    title: "Org 'TradeHub' approaching lead quota",
    body: "Usage at 94% of limit",
    time: "10 min ago",
  },
  {
    id: "a2",
    Icon: Users,
    iconColor: "#60A5FA",
    iconBg: "#60A5FA22",
    title: "New org 'ForexPro' created",
    body: "Owner: Raj Menon registered",
    time: "2h ago",
  },
  {
    id: "a3",
    Icon: CheckCircle,
    iconColor: "#22D3A0",
    iconBg: "#22D3A022",
    title: "KB processing complete",
    body: "For 'Titan Main' — 3 documents indexed",
    time: "5h ago",
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatChipCard({ chip }: { chip: StatChip }) {
  return (
    <div
      className="flex-shrink-0 flex flex-col gap-1 w-[120px] p-3 rounded-[10px]
                 bg-[#141422] border border-[#2A2A42]"
    >
      <span
        className="flex items-center justify-center w-7 h-7 rounded-lg"
        style={{ background: chip.iconBg }}
      >
        <chip.Icon
          size={16}
          style={{ color: chip.valueColor ?? "#F0F0FF" }}
          weight="fill"
        />
      </span>
      <span
        className="font-display font-bold text-[22px] leading-none"
        style={{ color: chip.valueColor ?? "#F0F0FF" }}
      >
        {chip.value}
      </span>
      <span className="font-sans text-[11px] text-[#8888AA]">{chip.label}</span>
    </div>
  );
}

function OrgCardItem({ org, onClick }: { org: OrgCard; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#141422] border border-[#2A2A42]
                 active:scale-[0.97] transition-transform text-left"
    >
      <span
        className="w-9 h-9 rounded-full bg-[#C4232D] flex items-center justify-center
                   font-display font-bold text-[14px] text-white shrink-0"
      >
        {org.initial}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-sans font-semibold text-[14px] text-[#F0F0FF] truncate">
          {org.name}
        </div>
        <div className="font-sans text-[12px] text-[#8888AA] truncate">
          Owner: {org.ownerName}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-sans font-semibold text-[13px] text-[#E8B94F]">
            {org.aum}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              background: org.isActive ? "#22D3A022" : "#55557022",
              color: org.isActive ? "#22D3A0" : "#555570",
            }}
          >
            {org.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-display font-bold text-[16px] text-[#F0F0FF]">
          {org.leadCount}
        </div>
        <div className="font-sans text-[10px] text-[#555570]">leads</div>
      </div>
    </button>
  );
}

function AlertRow({ alert }: { alert: AlertItem }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#2A2A42] last:border-0">
      <span
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ background: alert.iconBg }}
      >
        <alert.Icon
          size={18}
          style={{ color: alert.iconColor }}
          weight="fill"
        />
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-sans font-semibold text-[13px] text-[#F0F0FF] leading-snug">
          {alert.title}
        </div>
        <div className="font-sans text-[12px] text-[#8888AA] mt-0.5">
          {alert.body}
        </div>
      </div>
      <span className="font-mono text-[11px] text-[#555570] shrink-0 pt-0.5">
        {alert.time}
      </span>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function SuperadminHome({
  onMoreOpen,
  onOrgClick,
}: SuperadminHomeProps) {
  return (
    <MobileShell
      role="SUPERADMIN"
      activeTab="home"
      pageTitle="Platform Overview"
      notificationCount={2}
      verifyBadgeCount={0}
      userInitials="SA"
      showLiveDot
      onTabChange={(tab) => tab === "more" && onMoreOpen?.()}
    >
      <div className="pb-6">
        {/* Section 1 — Stat strip */}
        <div className="px-4 pt-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {STAT_CHIPS.map((chip, i) => (
              <StatChipCard key={i} chip={chip} />
            ))}
          </div>
        </div>

        {/* Section 2 — Platform funnel chart */}
        <div className="mx-4 mt-4 p-4 rounded-xl bg-[#141422] border border-[#2A2A42]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-sans font-semibold text-[14px] text-[#F0F0FF]">
              Platform Funnel — 30 Days
            </span>
            <LiveDot />
          </div>
          <p className="font-sans text-[12px] text-[#8888AA] mb-3">
            All organizations combined
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart
              data={FUNNEL_DATA}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C4232D" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#C4232D" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gFtd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22D3A0" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22D3A0" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  background: "#1C1C2E",
                  border: "1px solid #2A2A42",
                  borderRadius: 8,
                }}
                labelStyle={{ display: "none" }}
                itemStyle={{ color: "#F0F0FF", fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="#C4232D"
                fill="url(#gLeads)"
                strokeWidth={1.5}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="registered"
                stroke="#60A5FA"
                fill="url(#gReg)"
                strokeWidth={1.5}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="ftd"
                stroke="#22D3A0"
                fill="url(#gFtd)"
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-2">
            {[
              ["#C4232D", "Leads"],
              ["#60A5FA", "Registered"],
              ["#22D3A0", "FTD"],
            ].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: c }}
                />
                <span className="font-sans text-[11px] text-[#8888AA]">
                  {l}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Section 3 — Organizations */}
        <div className="mx-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans font-semibold text-[14px] text-[#F0F0FF]">
              Organizations
            </span>
            <button className="flex items-center gap-1 font-sans text-[12px] text-[#C4232D]">
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {ORGS.map((org) => (
              <OrgCardItem
                key={org.id}
                org={org}
                onClick={() => onOrgClick?.(org.id)}
              />
            ))}
          </div>
        </div>

        {/* Section 4 — System alerts */}
        <div className="mx-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans font-semibold text-[14px] text-[#F0F0FF]">
              System Alerts
            </span>
            <span className="font-mono text-[11px] text-[#555570]">
              Just now
            </span>
          </div>
          <div className="rounded-xl bg-[#141422] border border-[#2A2A42] px-4">
            {ALERTS.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
