"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ToggleLeft, ToggleRight, Eye, Hash } from "@phosphor-icons/react";
import { Icon } from "@iconify/react";
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
import { LEAD_STATUS_BADGE } from "@/lib/badge-config";
import { cn } from "@/lib/utils";

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
        const name = lead.displayName ?? lead.username ?? lead.telegramUserId;
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return (
          <Link
            href={`/leads/${lead.id}`}
            className="flex items-center gap-3 group/lead"
          >
            <div className="relative flex-shrink-0">
              <Avatar className="h-9 w-9 rounded-full border border-border">
                <AvatarFallback className="text-[11px] font-semibold text-muted-foreground bg-muted">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate group-hover/lead:text-primary transition-colors">
                {lead.displayName ?? lead.username ?? "—"}
              </span>
              <span className="text-xs text-muted-foreground truncate mt-0.5">
                {lead.email ?? "—"}
              </span>
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
            <div className="flex items-center gap-1.5">
              <Icon
                icon="logos:telegram"
                className="h-3.5 w-3.5 flex-shrink-0"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs font-semibold text-[#229ED9] font-mono cursor-default hover:underline underline-offset-2">
                      @{lead.username ?? "—"}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-mono text-xs">
                      ID: {lead.telegramUserId}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {lead.hfmBrokerId && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Hash className="h-3 w-3" />
                <span className="font-mono text-xs">{lead.hfmBrokerId}</span>
              </div>
            )}
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
        const badgeInfo = LEAD_STATUS_BADGE[row.original.status];
        const label = badgeInfo
          ? t(badgeInfo.labelKey)
          : row.original.status.replace(/_/g, " ");
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold",
              badgeInfo?.cls ?? "bg-muted text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                badgeInfo?.dotCls ?? "bg-muted-foreground",
              )}
            />
            {label}
          </span>
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
        if (!val)
          return (
            <span className="text-muted-foreground font-mono text-xs">—</span>
          );
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
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-foreground font-mono">{topDate}</span>
            <span className="text-xs text-muted-foreground font-mono">
              {botTime}
            </span>
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
          return (
            <span className="text-muted-foreground font-mono text-xs">—</span>
          );
        return (
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-sm font-semibold text-foreground">
              ${Number(balance).toLocaleString()}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
              USD
            </span>
          </div>
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
          <div className="flex items-center justify-end gap-1.5">
            {/* Handover toggle — no border, clean inline */}
            <div className="flex items-center gap-1.5 mr-1">
              <span className="text-[10px] font-semibold text-muted-foreground tracking-wider select-none">
                {t("leads.col.handover")}
              </span>
              <button
                type="button"
                onClick={() =>
                  onHandoverToggle(lead.id, lead.handoverMode ?? false)
                }
                className="cursor-pointer flex items-center"
                aria-label={`Toggle handover for ${lead.displayName ?? lead.username}`}
              >
                {lead.handoverMode ? (
                  <ToggleRight
                    className="h-6 w-6 text-red-500 transition-colors"
                    weight="fill"
                  />
                ) : (
                  <ToggleLeft
                    className="h-6 w-6 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    weight="fill"
                  />
                )}
              </button>
            </div>
            <Link href={`/leads/${lead.id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                aria-label="View lead"
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
