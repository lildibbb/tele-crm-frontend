"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { CheckCircle, XCircle, Chat, Eye, Clock } from "@phosphor-icons/react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/store/leadsStore";
import { LeadStatus } from "@/types/enums";

function StatusBadge({ status }: { status: string }) {
  if (status === LeadStatus.DEPOSIT_CONFIRMED)
    return (
      <Badge className="badge badge-success gap-1">
        <CheckCircle weight="duotone" size={11} />
        Approved
      </Badge>
    );
  if (status === LeadStatus.REJECTED)
    return (
      <Badge className="badge badge-danger gap-1">
        <XCircle weight="duotone" size={11} />
        Rejected
      </Badge>
    );
  return (
    <Badge className="badge badge-warning gap-1">
      <Clock weight="regular" size={11} />
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
            <div className="w-9 h-9 rounded-full bg-crimson/12 border border-crimson/20 flex items-center justify-center text-crimson font-display font-bold flex-shrink-0 text-[13px]">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-[13px] font-sans font-semibold text-text-primary truncate">
                {lead.displayName ?? lead.username ?? "—"}
              </p>
              <p className="text-[11px] font-sans text-text-muted data-mono truncate">
                {lead.telegramUserId}
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
          <span className="font-display font-bold text-gold data-mono text-[16px]">
            ${Number(balance).toLocaleString()}
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
                  className="h-8 bg-success/10 text-success hover:bg-success/20 border border-success/25 rounded-[8px] gap-1 font-semibold text-[12px] px-2.5"
                >
                  <CheckCircle weight="duotone" size={13} />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(lead.id)}
                  className="h-8 border-danger/30 text-danger hover:bg-danger/10 hover:border-danger/50 rounded-[8px] gap-1 font-semibold text-[12px] px-2.5"
                >
                  <XCircle weight="duotone" size={13} />
                  Reject
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onAskMore(lead.id)}
                  className="w-8 h-8 rounded-[8px] border border-border-subtle text-text-secondary hover:text-info hover:border-info/30"
                >
                  <Chat weight="regular" size={13} />
                </Button>
              </>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onViewReceipt(lead.id)}
              className="w-8 h-8 text-text-muted hover:text-text-primary"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Link href={`/leads/${lead.id}`}>
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 text-text-muted hover:text-text-primary"
              >
                <Eye className="h-3.5 w-3.5" />
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
