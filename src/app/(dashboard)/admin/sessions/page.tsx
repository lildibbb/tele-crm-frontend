"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { superadminApi, type AdminSession } from "@/lib/api/superadmin";
import { queryKeys } from "@/queries/queryKeys";
import { ProhibitInset, Monitor, DeviceMobile } from "@phosphor-icons/react";
import { useT, K } from "@/i18n";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MobileAdminSessions from "@/components/mobile/MobileAdminSessions";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { parseUserAgent, formatUA } from "@/lib/utils/parseUserAgent";

function truncate(str: string, len = 12) {
  return str.length <= len ? str : `${str.slice(0, len)}…`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ROLE_BADGE_VARIANT: Record<string, "destructive" | "secondary" | "outline"> = {
  SUPERADMIN: "destructive",
  OWNER: "destructive",
  ADMIN: "secondary",
};

function getSessionColumns({
  onRevoke,
  t,
}: {
  onRevoke: (id: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}): ColumnDef<AdminSession>[] {
  return [
    {
      id: "user",
      accessorFn: (row) => row.user?.email ?? row.userId,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="User" />
      ),
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium text-text-primary truncate">
              {user?.email ?? truncate(row.original.userId, 20)}
            </span>
            {user?.role && (
              <Badge
                variant={ROLE_BADGE_VARIANT[user.role] ?? "outline"}
                className="w-fit text-[10px] px-1.5 py-0 mt-0.5 uppercase tracking-wide"
              >
                {user.role}
              </Badge>
            )}
          </div>
        );
      },
      enableSorting: true,
      meta: {
        label: "User",
        variant: "text",
        placeholder: "Search by email…",
      },
    },
    {
      id: "device",
      accessorFn: (row) => row.userAgent ?? "",
      header: "Device",
      cell: ({ row }) => {
        const parsed = parseUserAgent(row.original.userAgent);
        const Icon = parsed.deviceType === "mobile" ? DeviceMobile : Monitor;
        return (
          <div className="flex items-center gap-2">
            <Icon size={15} className="text-text-secondary flex-shrink-0" />
            <span className="text-xs text-text-secondary whitespace-nowrap">
              {formatUA(parsed)}
            </span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-text-secondary">
          {row.original.ipAddress ?? "—"}
        </span>
      ),
      enableSorting: false,
      meta: {
        label: "IP Address",
        variant: "text",
        placeholder: "Filter by IP…",
      },
    },
    {
      accessorKey: "lastActiveAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Last Active" />
      ),
      cell: ({ row }) => (
        <span
          className="text-sm text-text-secondary whitespace-nowrap"
          title={formatDate(row.original.lastActiveAt)}
        >
          {formatRelative(row.original.lastActiveAt)}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: "expiresAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t(K.superadmin.sessions.expiresAt)}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-text-secondary whitespace-nowrap">
          {formatDate(row.original.expiresAt)}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: "actions",
      header: () => (
        <span className="sr-only">{t(K.superadmin.sessions.actions)}</span>
      ),
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onRevoke(row.original.id)}
            className="gap-1.5 h-7 text-xs"
          >
            <ProhibitInset size={13} />
            {t(K.superadmin.sessions.revoke)}
          </Button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
    },
  ];
}

function SessionsDesktop() {
  const t = useT();
  const queryClient = useQueryClient();
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "lastActiveAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: queryKeys.superadmin.sessions(),
    queryFn: () => superadminApi.listSessions(),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => superadminApi.revokeSession(id),
    onSuccess: (_, id) => {
      toast.success(t(K.superadmin.toast.sessionRevoked, { id: truncate(id) }));
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.sessions(),
      });
      setRevokeId(null);
    },
    onError: () => toast.error(t(K.superadmin.toast.sessionRevokeFailed)),
  });

  const columns = useMemo(
    () => getSessionColumns({ onRevoke: setRevokeId, t }),
    [t],
  );

  const table = useReactTable({
    data: sessions,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {t(K.superadmin.sessions.title)}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {isLoading
            ? t(K.superadmin.sessions.subtitle)
            : `${t(K.superadmin.sessions.subtitle)} · ${sessions.length} active sessions`}
        </p>
      </div>

      <div>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <DataTable table={table}>
            <DataTableToolbar table={table} />
          </DataTable>
        )}
      </div>

      <AlertDialog
        open={!!revokeId}
        onOpenChange={(open) => {
          if (!open) setRevokeId(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(K.superadmin.sessions.revokeTitle)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(K.superadmin.sessions.revokeDesc)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t(K.common.cancel)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revokeId && revokeMutation.mutate(revokeId)}
              disabled={revokeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t(K.superadmin.sessions.revoke)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminSessionsPage() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileAdminSessions />;
  return <SessionsDesktop />;
}

