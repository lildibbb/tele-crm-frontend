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
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/store/leadsStore";
import { LeadStatus } from "@/types/enums";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function StatusBadge({ status }: { status: string }) {
  if (status === LeadStatus.DEPOSIT_CONFIRMED)
    return (
      <Badge className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/8 border border-success/20 text-success text-[11px] font-semibold shadow-none">
        <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
        Approved
      </Badge>
    );
  if (status === LeadStatus.REJECTED)
    return (
      <Badge className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger/8 border border-danger/20 text-danger text-[11px] font-semibold shadow-none">
        <span className="w-1.5 h-1.5 rounded-full bg-danger flex-shrink-0" />
        Rejected
      </Badge>
    );
  return (
    <Badge className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border-default text-text-secondary text-[11px] font-semibold shadow-none">
      <span
        className="w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0"
        style={{ animation: "pulse-live 2.4s ease-in-out infinite" }}
      />
      Pending
    </Badge>
  );
}

interface VerificationColumnsProps {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onAskMore: (id: string) => void;
  onViewReceipt: (id: string) => void;
}

export function getVerificationColumns({
  onApprove,
  onReject,
  onAskMore,
  onViewReceipt,
}: VerificationColumnsProps): ColumnDef<Lead>[] {
  return [
    {
      id: "lead",
      accessorKey: "displayName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Lead" />
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
          .slice(0, 2)
          .toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 rounded-full bg-elevated border border-border-default flex-shrink-0">
              <AvatarFallback className="text-[11px] font-semibold text-text-secondary bg-transparent">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="data-mono">{lead.displayName}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="text-blue-500 text-[12px]">
                      @{lead.username ?? "-"}
                    </span>
                    <p className="text-text-muted text-[12px]">
                      Telegram ID: {lead.telegramUserId}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-[11px] font-sans text-text-muted data-mono truncate">
                {lead.email ?? "-"}
              </p>
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
      header: "HFM Account",
      cell: ({ row }) => (
        <span className="data-mono text-[12px] text-text-secondary">
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
        <DataTableColumnHeader column={column} label="Amount" />
      ),
      cell: ({ row }) => {
        const balance = row.original.depositBalance;
        if (!balance || balance === "—")
          return <span className="text-text-muted data-mono">—</span>;
        return (
          <span className="font-display font-bold text-gold data-mono text-[13px]">
            ${Number(balance).toLocaleString()}{" "}
            <span className="text-[10px] text-text-muted font-normal tracking-wide">USD</span>
          </span>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: "submittedAt",
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Submitted" />
      ),
      cell: ({ row }) => {
        const val = row.original.updatedAt;
        if (!val) return <span className="text-text-muted data-mono">—</span>;
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
          <div className="flex items-center gap-1.5 text-text-muted text-[12px]">
            <Clock size={11} weight="regular" />
            <span className="data-mono" title={date.toLocaleString()}>
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
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex items-center justify-end gap-1.5">
            {lead.status === LeadStatus.DEPOSIT_REPORTED && (
              <>
                <Button
                  size="sm"
                  onClick={() => onApprove(lead.id)}
                  className="h-8 bg-success/10 text-success hover:bg-success/20 border border-success/30 rounded-[8px] gap-1.5 font-semibold text-[13px] px-3 shadow-none transition-colors"
                >
                  <CheckCircle weight="bold" size={15} />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(lead.id)}
                  className="h-8 bg-danger/5 text-danger hover:bg-danger/10 border-danger/30 hover:border-danger/50 rounded-[8px] gap-1.5 font-semibold text-[13px] px-3 shadow-none transition-colors"
                >
                  <XCircle weight="bold" size={15} />
                  Reject
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onAskMore(lead.id)}
                  className="w-8 h-8 rounded-[8px] border border-border-default/60 bg-elevated/30 text-text-secondary hover:text-text-primary hover:bg-elevated hover:border-border-default transition-all ml-1"
                >
                  <Chat weight="duotone" size={15} />
                </Button>
              </>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onViewReceipt(lead.id)}
              className="w-8 h-8 text-text-muted hover:text-text-primary ml-0.5 rounded-lg"
              title="View Receipt"
            >
              <Receipt weight="duotone" className="h-[18px] w-[18px]" />
            </Button>
            <Link href={`/leads/${lead.id}`}>
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 text-text-muted hover:text-text-primary rounded-lg"
                title="View Lead Details"
              >
                <CaretRight weight="bold" className="h-[15px] w-[15px]" />
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
