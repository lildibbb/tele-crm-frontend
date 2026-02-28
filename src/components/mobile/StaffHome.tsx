"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Users, ArrowRight } from "@phosphor-icons/react";
import MobileShell from "./MobileShell";
import MobileMoreDrawer from "./MobileMoreDrawer";
import { useLeadsStore } from "@/store/leadsStore";
import { useAuthStore } from "@/store/authStore";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface StaffHomeProps {
  readonly onMoreOpen?: () => void;
  readonly onVerificationQueue?: () => void;
  readonly onMyLeads?: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  NEW:               "var(--info)",
  REGISTERED:        "#A855F7",
  DEPOSIT_REPORTED:  "var(--warning)",
  DEPOSIT_CONFIRMED: "var(--success)",
  REJECTED:          "var(--danger)",
};

const STATUS_LABEL: Record<string, string> = {
  NEW:               "NEW",
  REGISTERED:        "REGISTERED",
  DEPOSIT_REPORTED:  "PROOF PENDING",
  DEPOSIT_CONFIRMED: "CONFIRMED",
};

// ── Main ───────────────────────────────────────────────────────────────────────
export default function StaffHome({
  onMoreOpen,
  onVerificationQueue,
  onMyLeads,
}: StaffHomeProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { user } = useAuthStore();
  const { leads, total, isLoading, fetchLeads } = useLeadsStore();
  const { summary, fetchSummary } = useAnalyticsStore();

  useEffect(() => {
    fetchLeads({ skip: 0, take: 5, orderBy: "createdAt", order: "desc" });
    fetchSummary();
  }, [fetchLeads, fetchSummary]);

  const firstName = user?.email?.split("@")[0] ?? "Staff";
  const pendingCount = summary?.kpi?.pendingVerifications?.current ?? 0;

  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <MobileShell
        role="STAFF"
        activeTab="home"
        pageTitle={`Hi, ${firstName}`}
        verifyBadgeCount={pendingCount}
        onTabChange={(tab) => {
          if (tab === "more") { setMoreOpen(true); onMoreOpen?.(); }
        }}
      >
      <div className="px-4 pb-6 pt-4">
        {/* Greeting */}
        <div className="mb-5">
          <p className="font-sans text-[13px] text-text-muted">Welcome back</p>
          <h1 className="font-display font-bold text-[24px] text-text-primary mt-0.5">
            {user?.email ?? "Staff"}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="rounded-full px-2 py-0.5 bg-elevated font-sans font-medium text-[11px] text-text-secondary">
              STAFF
            </span>
            <span className="font-sans text-[12px] text-text-muted">{today}</span>
          </div>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            onClick={onVerificationQueue}
            className="flex flex-col gap-2 p-4 rounded-xl bg-card border border-border-subtle active:scale-[0.97] transition-transform text-left min-h-[100px] shadow-sm"
          >
            <ShieldCheck size={28} className="text-crimson" weight="fill" />
            <span className="font-sans font-semibold text-[14px] text-text-primary">
              Verification Queue
            </span>
            <div className="flex items-center justify-between">
              <span className="rounded-full px-2 py-0.5 bg-[color-mix(in_srgb,var(--warning)_15%,transparent)] font-sans text-[11px] font-medium text-warning">
                {pendingCount > 0 ? `${pendingCount} pending` : "All clear"}
              </span>
              <ArrowRight size={14} className="text-crimson" />
            </div>
          </button>

          <button
            onClick={onMyLeads}
            className="flex flex-col gap-2 p-4 rounded-xl bg-card border border-border-subtle active:scale-[0.97] transition-transform text-left min-h-[100px] shadow-sm"
          >
            <Users size={28} className="text-info" weight="fill" />
            <span className="font-sans font-semibold text-[14px] text-text-primary">
              My Leads
            </span>
            <div className="flex items-center justify-between">
              <span className="rounded-full px-2 py-0.5 bg-[color-mix(in_srgb,var(--info)_15%,transparent)] font-sans text-[11px] font-medium text-info">
                {isLoading ? "…" : `${total} leads`}
              </span>
              <ArrowRight size={14} className="text-info" />
            </div>
          </button>
        </div>

        {/* Today's leads */}
        <div className="mb-5">
          <h2 className="font-sans font-semibold text-[14px] text-text-primary mb-3">
            Recent Leads
          </h2>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-card animate-pulse shadow-sm" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {leads.slice(0, 5).map((lead) => {
                const color = STATUS_COLOR[lead.status] ?? "var(--text-muted)";
                return (
                  <Link key={lead.id} href={`/leads/${lead.id}`}>
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border-subtle active:scale-[0.97] transition-transform shadow-sm"
                      style={{ borderLeft: `3px solid ${color}` }}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-sans font-semibold text-[14px] text-text-primary truncate block">
                          {lead.displayName ?? "—"}
                        </span>
                        <span className="font-mono text-[12px] text-text-muted">
                          HFM: {lead.hfmBrokerId ?? "—"}
                        </span>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0"
                        style={{
                          background: `color-mix(in srgb, ${color} 15%, transparent)`,
                          color,
                        }}
                      >
                        {STATUS_LABEL[lead.status] ?? lead.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          {total > 5 && (
            <button
              onClick={onMyLeads}
              className="mt-2 font-sans text-[13px] text-crimson"
            >
              View all {total} leads →
            </button>
          )}
        </div>

        {/* Verification banner */}
        {pendingCount > 0 && (
          <button
            onClick={onVerificationQueue}
            className="w-full flex flex-col gap-1 p-4 rounded-xl border border-warning active:scale-[0.97] transition-transform text-left mb-5"
            style={{ background: "color-mix(in srgb, var(--warning) 10%, transparent)" }}
          >
            <span className="font-sans font-semibold text-[14px] text-text-primary">
              {pendingCount} deposits awaiting your review
            </span>
            <span className="font-sans text-[12px] text-text-secondary">
              Tap to open Verification Queue →
            </span>
          </button>
        )}
      </div>
      </MobileShell>
      <MobileMoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}

