"use client";

import type { ChartTooltipEntry, ChartTooltipProps } from "@/lib/types/chart";

const tooltipBase =
  "bg-elevated/95 backdrop-blur-sm border border-border-subtle rounded-xl px-3.5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.22)]";

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className={tooltipBase}>
      {label && (
        <p className="text-[11px] text-text-muted mb-2 font-sans">{label}</p>
      )}
      {payload.map((entry: ChartTooltipEntry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1 last:mb-0">
          <span
            className="w-1.5 h-3 rounded-full flex-shrink-0"
            style={{ background: entry.stroke ?? entry.fill }}
          />
          <span className="text-[12px] text-text-secondary font-sans capitalize">
            {entry.name}
          </span>
          <span className="text-[12px] text-text-primary data-mono ml-auto pl-4 font-semibold">
            {typeof entry.value === "number"
              ? entry.value.toLocaleString()
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BarTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className={tooltipBase}>
      <p className="text-[11px] text-text-muted mb-1.5 font-sans">{label}</p>
      <p className="data-mono text-[17px] text-gold leading-tight">
        {typeof payload[0].value === "number"
          ? payload[0].value.toLocaleString()
          : payload[0].value}
        <span className="text-[11px] text-text-muted font-sans ml-1.5">
          deposits
        </span>
      </p>
    </div>
  );
}

export function FunnelTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const colour =
    (item.payload?.["color"] as string | undefined) ?? item.color ?? item.fill;
  return (
    <div className={tooltipBase}>
      <p className="text-[11px] text-text-muted mb-1 font-sans">{item.name}</p>
      <p
        className="font-bold text-[18px] leading-tight data-mono"
        style={{ color: colour }}
      >
        {typeof item.value === "number"
          ? item.value.toLocaleString()
          : item.value}
      </p>
    </div>
  );
}
