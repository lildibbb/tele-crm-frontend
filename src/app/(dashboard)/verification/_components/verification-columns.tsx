"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Chat,
  Clock,
  Receipt,
  CaretRight,
} from "@phosphor-icons/react";
import { Icon } from "@iconify/react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/store/leadsStore";
import { LeadStatus } from "@/types/enums";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { K } from "@/i18n";
import { LEAD_STATUS_BADGE } from "@/lib/badge-config";
import { cn } from "@/lib/utils";

interface VerificationColumnsProps {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onAskMore: (id: string) => void;
  onViewReceipt: (id: string) => void;
  t: (key: string) => string;
}

export function getVerificationColumns({
  onApprove,
  onReject,
  onAskMore,
  onViewReceipt,
  t,
}: VerificationColumnsProps): ColumnDef<Lead>[] {
  return [
    {
      id: "lead",
      accessorKey: "displayName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t(K.verify.col.lead)} />
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
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-full border border-border flex-shrink-0">
              <AvatarFallback className="text-[11px] font-semibold text-muted-foreground bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm font-medium text-foreground truncate cursor-default">
                      {lead.displayName ?? "—"}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-mono text-xs">
                      ID: {lead.telegramUserId}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {lead.username ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <Icon
                    icon="logos:telegram"
                    className="h-3 w-3 flex-shrink-0"
                  />
                  <span className="text-xs font-semibold text-[#229ED9] font-mono">
                    @{lead.username}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                  {lead.email ?? "—"}
                </span>
              )}
            </div>
          </div>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: "hfmBrokerId",
      accessorKey: "hfmBrokerId",
      header: t(K.verification.hfmAccount),
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.original.hfmBrokerId ?? "—"}
        </span>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: "depositBalance",
      accessorKey: "depositBalance",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t(K.verification.amount)}
        />
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
      id: "submittedAt",
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t(K.verification.submitted)}
        />
      ),
      cell: ({ row }) => {
        const val = row.original.updatedAt;
        if (!val)
          return (
            <span className="text-muted-foreground font-mono text-xs">—</span>
          );
        const date = new Date(val);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffH = Math.floor(diffMin / 60);
        const diffD = Math.floor(diffH / 24);
        let display: string;
        if (diffMin < 1) display = "Just now";
        else if (diffMin < 60) display = `${diffMin}m ago`;
        else if (diffH < 24) display = `${diffH}h ago`;
        else if (diffD < 7) display = `${diffD}d ago`;
        else
          display = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        return (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={12} weight="regular" className="flex-shrink-0" />
            <span className="font-mono text-xs" title={date.toLocaleString()}>
              {display}
            </span>
          </div>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: "status",
      accessorKey: "status",
      header: t(K.verify.col.status),
      cell: ({ row }) => {
        const status = row.original.status;
        const badgeInfo = LEAD_STATUS_BADGE[status];
        const label = badgeInfo
          ? t(badgeInfo.labelKey)
          : status.replace(/_/g, " ");
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
                status === LeadStatus.DEPOSIT_REPORTED && "animate-pulse",
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
      id: "actions",
      header: () => <div className="text-right">{t(K.verify.col.actions)}</div>,
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {lead.status === LeadStatus.DEPOSIT_REPORTED && (
              <>
                <Button
                  size="sm"
                  onClick={() => onApprove(lead.id)}
                  className={cn(
                    "h-8 px-3 gap-1.5 text-xs font-semibold rounded-lg shadow-none transition-colors",
                    "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20",
                    "dark:text-emerald-400 dark:hover:bg-emerald-500/20",
                    "ring-1 ring-inset ring-emerald-500/20",
                  )}
                >
                  <CheckCircle weight="bold" size={14} />
                  {t(K.verify.approve)}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(lead.id)}
                  className={cn(
                    "h-8 px-3 gap-1.5 text-xs font-semibold rounded-lg shadow-none transition-colors",
                    "bg-red-500/5 text-red-700 hover:bg-red-500/10",
                    "dark:text-red-400",
                    "ring-1 ring-inset ring-red-500/20 border-0",
                  )}
                >
                  <XCircle weight="bold" size={14} />
                  {t(K.verify.reject)}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onAskMore(lead.id)}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Ask for more information"
                >
                  <Chat weight="regular" size={15} />
                </Button>
              </>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onViewReceipt(lead.id)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              aria-label={t(K.verification.viewReceipt)}
            >
              <Receipt weight="regular" className="h-4 w-4" />
            </Button>
            <Link href={`/leads/${lead.id}`}>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                aria-label="View lead"
              >
                <CaretRight weight="bold" className="h-3.5 w-3.5" />
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
