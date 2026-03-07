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
import { ProhibitInset } from "@phosphor-icons/react";
import { useT, K } from "@/i18n";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MobileAdminSessions from "@/components/mobile/MobileAdminSessions";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

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

function getSessionColumns({
  onRevoke,
  t,
}: {
  onRevoke: (id: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}): ColumnDef<AdminSession>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t(K.superadmin.sessions.sessionId)}
        />
      ),
      cell: ({ row }) => (
        <span
          className="font-mono text-xs text-text-secondary"
          title={row.original.id}
        >
          {truncate(row.original.id, 16)}
        </span>
      ),
      enableSorting: false,
      meta: {
        label: t(K.superadmin.sessions.sessionId),
        variant: "text",
        placeholder: "Search session ID…",
      },
    },
    {
      accessorKey: "userId",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t(K.superadmin.sessions.userId)}
        />
      ),
      cell: ({ row }) => (
        <span
          className="font-mono text-xs text-text-secondary"
          title={row.original.userId}
        >
          {truncate(row.original.userId, 16)}
        </span>
      ),
      enableSorting: false,
      meta: {
        label: t(K.superadmin.sessions.userId),
        variant: "text",
        placeholder: "Search user ID…",
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t(K.superadmin.sessions.createdAt)}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-text-secondary whitespace-nowrap">
          {formatDate(row.original.createdAt)}
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
      accessorKey: "userAgent",
      header: t(K.superadmin.sessions.userAgent),
      cell: ({ row }) => (
        <span
          className="text-xs text-text-secondary max-w-[220px] truncate block"
          title={row.original.userAgent ?? undefined}
        >
          {row.original.userAgent ?? "—"}
        </span>
      ),
      enableSorting: false,
      meta: {
        label: t(K.superadmin.sessions.userAgent),
        variant: "text",
        placeholder: "Filter user agent…",
      },
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
    { id: "createdAt", desc: true },
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
