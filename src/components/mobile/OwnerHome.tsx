"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  CurrencyDollar,
  TrendUp,
  ShieldCheck,
  Plus,
  ArrowRight,
} from "@phosphor-icons/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  Legend,
} from "recharts";
import MobileShell from "./MobileShell";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface OwnerHomeProps {
  readonly onMoreOpen?: () => void;
  readonly onAddLead?: () => void;
  readonly onViewAllLeads?: () => void;
  readonly onVerificationBanner?: () => void;
}

type LeadStatus =
  | "NEW"
  | "REGISTERED"
  | "DEPOSIT_REPORTED"
  | "DEPOSIT_CONFIRMED";

interface RecentLead {
  id: string;
  name: string;
  hfmId: string;
  status: LeadStatus;
  timeAgo: string;
  depositAmount?: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const FUNNEL_DATA = [
  { day: "Mon", leads: 31, registered: 22, ftd: 8 },
  { day: "Tue", leads: 38, registered: 27, ftd: 11 },
  { day: "Wed", leads: 28, registered: 18, ftd: 6 },
  { day: "Thu", leads: 45, registered: 34, ftd: 14 },
  { day: "Fri", leads: 42, registered: 28, ftd: 11 },
  { day: "Sat", leads: 35, registered: 24, ftd: 9 },
  { day: "Sun", leads: 52, registered: 38, ftd: 16 },
];

const RECENT_LEADS: RecentLead[] = [
  {
    id: "1",
    name: "Muhammad Hafiz",
    hfmId: "1029384",
    status: "DEPOSIT_REPORTED",
    timeAgo: "2h ago",
    depositAmount: "$500.00",
  },
  {
    id: "2",
    name: "Siti Aminah",
    hfmId: "HFM-77332",
    status: "REGISTERED",
    timeAgo: "4h ago",
  },
  {
    id: "3",
    name: "Daniel Kumar",
    hfmId: "HFM-55231",
    status: "NEW",
    timeAgo: "6h ago",
  },
];

const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "#60A5FA",
  REGISTERED: "#A855F7",
  DEPOSIT_REPORTED: "#F59E0B",
  DEPOSIT_CONFIRMED: "#22D3A0",
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "NEW",
  REGISTERED: "REGISTERED",
  DEPOSIT_REPORTED: "DEPOSIT REPORTED",
  DEPOSIT_CONFIRMED: "CONFIRMED",
};

// ── Sub-components ─────────────────────────────────────────────────────────────
interface StatChipData {
  Icon: React.ElementType;
  iconBg: string;
  value: string;
  valueColor?: string;
  label: string;
}

const STAT_CHIPS: StatChipData[] = [
  { Icon: Users, iconBg: "#C4232D22", value: "42", label: "New Leads" },
  { Icon: UserCheck, iconBg: "#60A5FA22", value: "28", label: "Registered" },
  {
    Icon: CurrencyDollar,
    iconBg: "#E8B94F22",
    value: "11",
    valueColor: "#E8B94F",
    label: "FTD Today",
  },
  {
    Icon: TrendUp,
    iconBg: "#E8B94F22",
    value: "$84K",
    valueColor: "#E8B94F",
    label: "AUM",
  },
];

function StatChipCard({ chip }: { chip: StatChipData }) {
  return (
    <div className="flex-shrink-0 flex flex-col gap-1 w-[110px] p-3 rounded-[10px] bg-[#141422] border border-[#2A2A42]">
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

function LeadCard({ lead }: { lead: RecentLead }) {
  const accentColor = STATUS_COLORS[lead.status];
  return (
    <Link href={`/leads/${lead.id}`}>
      <div
        className="flex flex-col gap-2 p-3 rounded-xl bg-[#141422] border border-[#2A2A42]
                   active:scale-[0.97] transition-transform"
        style={{ borderLeft: `3px solid ${accentColor}` }}
      >
        <div className="flex items-center justify-between">
          <span className="font-sans font-semibold text-[15px] text-[#F0F0FF]">
            {lead.name}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: `${accentColor}22`, color: accentColor }}
          >
            {STATUS_LABELS[lead.status]}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[13px] text-[#8888AA]">
            HFM: {lead.hfmId}
          </span>
          <span className="font-sans text-[11px] text-[#555570]">
            {lead.timeAgo}
          </span>
        </div>
        {lead.depositAmount && (
          <div className="flex items-center gap-2">
            <span className="font-sans font-semibold text-[13px] text-[#E8B94F]">
              {lead.depositAmount}
            </span>
            <span className="font-sans text-[10px] uppercase tracking-wide text-[#555570]">
              DEPOSIT
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function OwnerHome({
  onMoreOpen,
  onAddLead,
  onViewAllLeads,
  onVerificationBanner,
}: OwnerHomeProps) {
  return (
    <MobileShell
      role="OWNER"
      activeTab="home"
      pageTitle="Dashboard"
      notificationCount={5}
      verifyBadgeCount={5}
      userInitials="OW"
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

        {/* Section 2 — IB Funnel chart */}
        <div className="mx-4 mt-4 p-4 rounded-xl bg-[#141422] border border-[#2A2A42]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-sans font-semibold text-[14px] text-[#F0F0FF]">
              IB Funnel — 7 Days
            </span>
            <span className="font-mono text-[12px] text-[#555570]">
              Jan 16-22
            </span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart
              data={FUNNEL_DATA}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <XAxis
                dataKey="day"
                tick={{
                  fill: "#555570",
                  fontSize: 10,
                  fontFamily: "JetBrains Mono",
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
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#C4232D"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="registered"
                stroke="#60A5FA"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="ftd"
                stroke="#22D3A0"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-1">
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

        {/* Section 3 — Verification banner */}
        <button
          onClick={onVerificationBanner}
          className="mx-4 mt-4 w-[calc(100%-2rem)] flex items-center gap-3 p-3 rounded-xl
                     border border-[#C4232D] active:scale-[0.97] transition-transform"
          style={{ background: "#C4232D1A" }}
        >
          <ShieldCheck
            size={20}
            className="text-[#C4232D] shrink-0"
            weight="fill"
          />
          <span className="font-sans font-semibold text-[14px] text-[#F0F0FF] flex-1 text-left">
            5 leads awaiting verification
          </span>
          <ArrowRight size={16} className="text-[#C4232D] shrink-0" />
        </button>

        {/* Section 4 — Recent leads */}
        <div className="mx-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans font-semibold text-[14px] text-[#F0F0FF]">
              Recent Leads
            </span>
            <button
              onClick={onViewAllLeads}
              className="flex items-center gap-1 font-sans text-[12px] text-[#C4232D]"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {RECENT_LEADS.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </div>

        {/* Section 5 — Today pills */}
        <div className="mx-4 mt-4 flex flex-wrap gap-2">
          {[
            { label: "42 leads today", color: "#C4232D" },
            { label: "11 FTDs", color: "#E8B94F" },
            { label: "+$12,400 AUM", color: "#22D3A0" },
          ].map(({ label, color }) => (
            <span
              key={label}
              className="rounded-full px-3 py-1 font-sans text-[12px] font-medium"
              style={{ background: `${color}1A`, color }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={onAddLead}
        className="fixed right-5 flex items-center justify-center w-14 h-14 rounded-full bg-[#C4232D]
                   shadow-lg shadow-[#C4232D40] active:scale-95 transition-transform z-30"
        style={{ bottom: "calc(56px + env(safe-area-inset-bottom) + 20px)" }}
        aria-label="Add Lead"
      >
        <Plus size={24} color="white" weight="bold" />
      </button>
    </MobileShell>
  );
}
