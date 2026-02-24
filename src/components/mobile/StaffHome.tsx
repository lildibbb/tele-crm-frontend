"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Users, ArrowRight } from "@phosphor-icons/react";
import MobileShell from "./MobileShell";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface StaffHomeProps {
  readonly staffName?: string;
  readonly onMoreOpen?: () => void;
  readonly onVerificationQueue?: () => void;
  readonly onMyLeads?: () => void;
}

interface AssignedLead {
  id: string;
  name: string;
  status: "NEW" | "REGISTERED";
  timeAgo: string;
}

interface ActivityItem {
  id: string;
  color: string;
  text: string;
  time: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const ASSIGNED_LEADS: AssignedLead[] = [
  { id: "1", name: "Ahmad Farouk", status: "NEW", timeAgo: "1h ago" },
  { id: "2", name: "Nurul Huda", status: "REGISTERED", timeAgo: "3h ago" },
  { id: "3", name: "Chen Wei Liang", status: "NEW", timeAgo: "5h ago" },
];

const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    color: "#22D3A0",
    text: "Lead #TJ-1284 verified successfully",
    time: "1h ago",
  },
  {
    id: "a2",
    color: "#F59E0B",
    text: "Siti Aminah submitted deposit receipt",
    time: "3h ago",
  },
  {
    id: "a3",
    color: "#60A5FA",
    text: "New lead Ahmad Farouk assigned to you",
    time: "5h ago",
  },
  {
    id: "a4",
    color: "#8888AA",
    text: "Staff meeting: bot script templates updated",
    time: "Yesterday",
  },
];

const STATUS_COLORS = { NEW: "#60A5FA", REGISTERED: "#A855F7" } as const;

// ── Main ───────────────────────────────────────────────────────────────────────
export default function StaffHome({
  staffName = "Ahmad Razali",
  onMoreOpen,
  onVerificationQueue,
  onMyLeads,
}: StaffHomeProps) {
  const firstName = staffName.split(" ")[0];
  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <MobileShell
      role="STAFF"
      activeTab="home"
      pageTitle={`Good morning, ${firstName}`}
      notificationCount={2}
      verifyBadgeCount={5}
      userInitials={staffName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)}
      showLiveDot={false}
      onTabChange={(tab) => tab === "more" && onMoreOpen?.()}
    >
      <div className="px-4 pb-6 pt-4">
        {/* Greeting */}
        <div className="mb-5">
          <p className="font-sans text-[13px] text-[#555570]">Welcome back</p>
          <h1 className="font-display font-bold text-[24px] text-[#F0F0FF] mt-0.5">
            {staffName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="rounded-full px-2 py-0.5 font-sans font-medium text-[11px] text-[#8888AA]"
              style={{ background: "#1C1C2E" }}
            >
              STAFF
            </span>
            <span className="font-sans text-[12px] text-[#555570]">
              {today}
            </span>
          </div>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            onClick={onVerificationQueue}
            className="flex flex-col gap-2 p-4 rounded-xl bg-[#141422] border border-[#2A2A42]
                       active:scale-[0.97] transition-transform text-left min-h-[100px]"
          >
            <ShieldCheck size={28} className="text-[#C4232D]" weight="fill" />
            <span className="font-sans font-semibold text-[14px] text-[#F0F0FF]">
              Verification Queue
            </span>
            <div className="flex items-center justify-between">
              <span
                className="rounded-full px-2 py-0.5 font-sans text-[11px] font-medium text-[#F59E0B]"
                style={{ background: "#F59E0B1A" }}
              >
                5 pending
              </span>
              <ArrowRight size={14} className="text-[#C4232D]" />
            </div>
          </button>

          <button
            onClick={onMyLeads}
            className="flex flex-col gap-2 p-4 rounded-xl bg-[#141422] border border-[#2A2A42]
                       active:scale-[0.97] transition-transform text-left min-h-[100px]"
          >
            <Users size={28} className="text-[#60A5FA]" weight="fill" />
            <span className="font-sans font-semibold text-[14px] text-[#F0F0FF]">
              My Leads
            </span>
            <div className="flex items-center justify-between">
              <span
                className="rounded-full px-2 py-0.5 font-sans text-[11px] font-medium text-[#60A5FA]"
                style={{ background: "#60A5FA1A" }}
              >
                12 assigned
              </span>
              <ArrowRight size={14} className="text-[#60A5FA]" />
            </div>
          </button>
        </div>

        {/* Today's assignments */}
        <div className="mb-5">
          <h2 className="font-sans font-semibold text-[14px] text-[#F0F0FF] mb-3">
            Today&apos;s New Leads
          </h2>
          <div className="flex flex-col gap-2">
            {ASSIGNED_LEADS.map((lead) => {
              const color = STATUS_COLORS[lead.status];
              return (
                <Link key={lead.id} href={`/leads/${lead.id}`}>
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#141422] border border-[#2A2A42]
                               active:scale-[0.97] transition-transform"
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-sans font-semibold text-[14px] text-[#F0F0FF]">
                        {lead.name}
                      </span>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: `${color}22`, color }}
                    >
                      {lead.status}
                    </span>
                    <span className="font-mono text-[11px] text-[#555570] shrink-0">
                      {lead.timeAgo}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <button className="mt-2 font-sans text-[13px] text-[#C4232D]">
            View all 12 assigned leads →
          </button>
        </div>

        {/* Verification banner */}
        <button
          onClick={onVerificationQueue}
          className="w-full flex flex-col gap-1 p-4 rounded-xl border border-[#F59E0B]
                     active:scale-[0.97] transition-transform text-left mb-5"
          style={{ background: "#F59E0B1A" }}
        >
          <span className="font-sans font-semibold text-[14px] text-[#F0F0FF]">
            3 deposits awaiting your review
          </span>
          <span className="font-sans text-[12px] text-[#8888AA]">
            Tap to open Verification Queue →
          </span>
        </button>

        {/* Recent activity */}
        <div>
          <h2 className="font-sans font-semibold text-[14px] text-[#F0F0FF] mb-3">
            Recent Activity
          </h2>
          <div className="flex flex-col gap-3">
            {ACTIVITY.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <span
                  className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                <span className="font-sans text-[13px] text-[#8888AA] flex-1 leading-snug">
                  {item.text}
                </span>
                <span className="font-mono text-[11px] text-[#555570] shrink-0">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
