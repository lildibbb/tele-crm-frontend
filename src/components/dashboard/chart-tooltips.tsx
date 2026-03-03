"use client";

import type { ChartTooltipEntry, ChartTooltipProps } from "@/lib/types/chart";

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border-default rounded-[14px] px-[14px] py-[10px] shadow-sm">
      <p className="text-[11px] text-text-secondary mb-2 font-sans">{label}</p>
      {payload.map((entry: ChartTooltipEntry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-[3px]">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: entry.stroke ?? entry.fill }}
          />
          <span className="text-[12px] text-text-secondary font-sans">
            {entry.name}
          </span>
          <span className="text-[12px] text-text-primary data-mono ml-auto pl-3">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BarTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border-default rounded-[14px] px-[14px] py-[10px] shadow-sm">
      <p className="text-[11px] text-text-secondary mb-1 font-sans">{label}</p>
      <p className="text-base data-mono text-gold leading-tight">
        {payload[0].value}{" "}
        <span className="text-[11px] text-text-muted font-sans">deposits</span>
      </p>
    </div>
  );
}

export function FunnelTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-card border border-border-default rounded-[14px] px-[14px] py-[10px] shadow-sm">
      <p className="text-[11px] text-text-secondary mb-1 font-sans">
        {item.name}
      </p>
      <p
        className="font-bold text-[18px] leading-tight data-mono"
        style={{
          color: (item.payload?.["color"] as string | undefined) ?? item.color,
        }}
      >
        {item.value.toLocaleString()}
      </p>
    </div>
  );
}
