"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  ToggleLeft,
  ToggleRight,
  Eye,
  Hash,
  TelegramLogo,
} from "@phosphor-icons/react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/store/leadsStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BADGE_MAP: Record<string, { labelKey: string; cls: string }> = {
  NEW: { labelKey: "status.new", cls: "badge-new" },
  CONTACTED: { labelKey: "status.contacted", cls: "badge-contacted" },
  DEPOSIT_REPORTED: { labelKey: "status.proofPending", cls: "badge-pending" },
  DEPOSIT_CONFIRMED: { labelKey: "status.confirmed", cls: "badge-confirmed" },
};

interface LeadsColumnsProps {
  onHandoverToggle: (id: string, current: boolean) => void;
  t: (key: string) => string;
}

export function getLeadsColumns({
  onHandoverToggle,
  t,
}: LeadsColumnsProps): ColumnDef<Lead>[] {
  return [
    {
      id: "lead",
      accessorKey: "displayName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("leads.col.lead")} />
      ),
      cell: ({ row }) => {
        const lead = row.original;
        const initials = (
          lead.displayName ??
          lead.username ??
          lead.telegramUserId
        )
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2);
        return (
          <Link href={`/leads/${lead.id}`} className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-8 w-8 rounded-full bg-elevated border border-border-default flex-shrink-0">
                <AvatarFallback className="text-[11px] font-semibold text-text-secondary bg-transparent">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-[13px] font-sans font-semibold text-text-primary truncate">
                {lead.displayName ?? lead.username ?? "—"}
              </p>
              <p className="text-[11px] font-sans text-text-muted truncate">
                {lead.email ?? "—"}
              </p>
            </div>
          </Link>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: "contactIds",
      header: t("leads.col.contactIds"),
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-info text-[12px] font-medium">
              <TelegramLogo
                className="h-3.5 w-3.5 text-info/80"
                weight="fill"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="data-mono">@{lead.username}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Telegram ID: {lead.telegramUserId}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
              <Hash className="h-3 w-3" />
              <span className="data-mono">{lead.hfmBrokerId ?? "—"}</span>
            </div>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: "status",
      accessorKey: "status",
      header: t("leads.col.status"),
      cell: ({ row }) => {
        const badgeInfo = BADGE_MAP[row.original.status];
        const label = badgeInfo
          ? t(badgeInfo.labelKey)
          : row.original.status.replace(/_/g, " ");
        const cls = badgeInfo ? badgeInfo.cls : "";
        return (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-current ${cls} bg-opacity-10 shadow-sm`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="text-[11.5px] font-medium tracking-wide">
              {label}
            </span>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: "registeredAt",
      accessorKey: "registeredAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t("leads.col.registered")}
        />
      ),
      cell: ({ row }) => {
        const val = row.original.registeredAt;
        if (!val) return <span className="text-text-muted data-mono">—</span>;
        const date = new Date(val);
        const topDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const botTime = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <div className="flex flex-col gap-0.5 data-mono">
            <span className="text-text-primary text-[13px]">{topDate}</span>
            <span className="text-text-muted text-[11px]">{botTime}</span>
          </div>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: "depositBalance",
      accessorKey: "depositBalance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("leads.col.balance")} />
      ),
      cell: ({ row }) => {
        const balance = row.original.depositBalance;
        if (!balance || balance === "—")
          return <span className="text-text-muted data-mono">—</span>;
        return (
          <span className="data-mono text-gold font-semibold text-[13px]">
            ${Number(balance).toLocaleString()}{" "}
            <span className="text-[10px] text-text-muted font-normal tracking-wide">
              USD
            </span>
          </span>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("leads.col.actions")}</div>,
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <div className="flex items-center gap-2 mr-1">
              <span className="text-[9.5px] uppercase font-bold text-text-muted tracking-wider">
                {t("leads.col.handover")}
              </span>
              <button
                type="button"
                onClick={() =>
                  onHandoverToggle(lead.id, lead.handoverMode ?? false)
                }
                className="cursor-pointer flex items-center"
              >
                {lead.handoverMode ? (
                  <ToggleRight
                    className="h-7 w-7 text-crimson transition-colors"
                    weight="fill"
                  />
                ) : (
                  <ToggleLeft
                    className="h-7 w-7 text-text-muted transition-colors border-current rounded-full"
                    weight="fill"
                  />
                )}
              </button>
            </div>
            <Link href={`/leads/${lead.id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-text-muted hover:text-text-primary"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
  ];
}
