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

const BADGE_MAP: Record<string, { label: string; cls: string }> = {
  NEW: { label: "New", cls: "badge-new" },
  CONTACTED: { label: "Contacted", cls: "badge-contacted" },
  REGISTERED: { label: "Registered", cls: "badge-registered" },
  DEPOSIT_REPORTED: { label: "Proof Pending", cls: "badge-pending" },
  DEPOSIT_CONFIRMED: { label: "Confirmed", cls: "badge-confirmed" },
};

interface LeadsColumnsProps {
  onHandoverToggle: (id: string, current: boolean) => void;
  onApprove: (id: string) => void;
}

export function getLeadsColumns({
  onHandoverToggle,
  onApprove,
}: LeadsColumnsProps): ColumnDef<Lead>[] {
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
          .slice(0, 2);
        return (
          <Link href={`/leads/${lead.id}`} className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-elevated border border-border-subtle flex items-center justify-center text-text-primary font-display font-medium text-sm flex-shrink-0">
                {initials}
              </div>
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
      header: "Contact IDs",
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-info text-[12px] font-medium">
              <TelegramLogo
                className="h-3.5 w-3.5 text-info/80"
                weight="fill"
              />
              <span className="data-mono">{lead.telegramUserId}</span>
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
      header: "Status",
      cell: ({ row }) => {
        const badge = BADGE_MAP[row.original.status] ?? {
          label: row.original.status,
          cls: "",
        };
        return (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-current ${badge.cls} bg-opacity-10 shadow-sm`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="text-[11.5px] font-medium tracking-wide">
              {badge.label}
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
        <DataTableColumnHeader column={column} label="Registered" />
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
        <DataTableColumnHeader column={column} label="Balance" />
      ),
      cell: ({ row }) => {
        const balance = row.original.depositBalance;
        if (!balance || balance === "—")
          return <span className="text-text-muted data-mono">—</span>;
        return (
          <span className="data-mono text-gold font-semibold text-[13.5px]">
            {balance}
          </span>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            {lead.status === "DEPOSIT_REPORTED" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onApprove(lead.id)}
                className="h-8 text-[11px] uppercase font-bold text-crimson border-crimson hover:bg-crimson/10 px-4 tracking-wider"
              >
                Approve
              </Button>
            ) : (
              <div className="flex items-center gap-2 mr-1">
                <span className="text-[9.5px] uppercase font-bold text-text-muted tracking-wider">
                  Handover
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
            )}
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
