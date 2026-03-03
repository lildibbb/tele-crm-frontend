"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountUp } from "@/lib/hooks/use-count-up";

// ── Types ──────────────────────────────────────────────────────
interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: string;
  deltaPositive?: boolean;
  goldValue?: boolean;
}

export interface KpiCardsData {
  totalLeads: { current: number; changePercentage: number };
  contactedLeads: { current: number; changePercentage: number };
  verifiedClients: { current: number; changePercentage: number };
  formSubmissions: { current: number; changePercentage: number };
}

interface KpiCardsProps {
  data: KpiCardsData | null;
  isLoading: boolean;
  icons: {
    total: React.ElementType;
    contacted: React.ElementType;
    depositors: React.ElementType;
    pending: React.ElementType;
  };
  labels: {
    total: string;
    contacted: string;
    depositors: string;
    pending: string;
  };
  viewAllLabel: string;
  viewAllHref: string;
}

// ── KPI Card ────────────────────────────────────────────────────
const KpiCard = React.memo(function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaPositive = true,
  goldValue = false,
}: KpiCardProps) {
  const numericTarget = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const prefix = value.match(/[^0-9,]+(?=[0-9])/)?.[0] ?? "";
  const suffix = value.match(/[^0-9]+$/)?.[0] ?? "";
  const count = useCountUp(numericTarget, 1200);
  const displayValue = prefix + count.toLocaleString() + suffix;

  return (
    <div className="kpi-stat-card bg-elevated rounded-xl p-5 border border-border-subtle shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <Icon size={22} weight="duotone" className="text-text-secondary" />
        <span
          className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            deltaPositive
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          }`}
        >
          {deltaPositive ? (
            <ArrowUpRight size={12} weight="regular" />
          ) : (
            <ArrowDownRight size={12} weight="regular" />
          )}
          {delta}
        </span>
      </div>
      <p
        className={`text-2xl font-bold data-mono leading-none mb-1.5 tracking-tight ${
          goldValue ? "text-gold" : "text-text-primary"
        }`}
      >
        {displayValue}
      </p>
      <p className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
});

// ── KPI Cards Grid ──────────────────────────────────────────────
export const KpiCards = React.memo(function KpiCards({
  data,
  isLoading,
  icons,
  labels,
  viewAllLabel,
  viewAllHref,
}: KpiCardsProps) {
  return (
    <div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {isLoading && !data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-2xl" />
          ))
        ) : (
          <>
            <KpiCard
              icon={icons.total}
              label={labels.total}
              value={String(data?.totalLeads.current ?? 0)}
              delta={`${data?.totalLeads.changePercentage ?? 0}%`}
              deltaPositive={(data?.totalLeads.changePercentage ?? 0) >= 0}
            />
            <KpiCard
              icon={icons.contacted}
              label={labels.contacted}
              value={String(data?.contactedLeads.current ?? 0)}
              delta={`${data?.contactedLeads.changePercentage ?? 0}%`}
              deltaPositive={(data?.contactedLeads.changePercentage ?? 0) >= 0}
            />
            <KpiCard
              icon={icons.depositors}
              label={labels.depositors}
              value={String(data?.verifiedClients.current ?? 0)}
              delta={`${data?.verifiedClients.changePercentage ?? 0}%`}
              deltaPositive={(data?.verifiedClients.changePercentage ?? 0) >= 0}
              goldValue
            />
            <KpiCard
              icon={icons.pending}
              label={labels.pending}
              value={String(data?.formSubmissions.current ?? 0)}
              delta={`${data?.formSubmissions.changePercentage ?? 0}%`}
              deltaPositive={(data?.formSubmissions.changePercentage ?? 0) >= 0}
            />
          </>
        )}
        {/* View all link */}
        <div className="col-span-2 xl:col-span-4 flex justify-end">
          <a
            href={viewAllHref}
            className="text-crimson text-xs font-sans font-medium flex items-center gap-1 hover:underline"
          >
            {viewAllLabel}{" "}
            <ArrowUpRight size={12} weight="bold" className="ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
});
