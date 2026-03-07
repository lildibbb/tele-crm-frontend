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
import { superadminApi, type QueueJobCount } from "@/lib/api/superadmin";
import { queryKeys } from "@/queries/queryKeys";
import { ArrowsClockwise, Trash } from "@phosphor-icons/react";
import { useT, K } from "@/i18n";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MobileAdminQueues from "@/components/mobile/MobileAdminQueues";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

function getQueueColumns({
  onRetry,
  onPurge,
  isPending,
  t,
}: {
  onRetry: (name: string) => void;
  onPurge: (name: string) => void;
  isPending: boolean;
  t: (key: string, params?: Record<string, string>) => string;
}): ColumnDef<QueueJobCount>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t(K.superadmin.queues.queueName)}
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium font-mono text-sm text-text-primary">
          {row.original.name}
        </span>
      ),
      enableSorting: true,
      meta: {
        label: t(K.superadmin.queues.queueName),
        variant: "text",
        placeholder: "Search queue…",
      },
    },
    {
      accessorKey: "waiting",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t(K.superadmin.queues.waiting)}
        />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant="secondary">{row.original.waiting}</Badge>
        </div>
      ),
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t(K.superadmin.queues.active)}
        />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant={row.original.active > 0 ? "default" : "secondary"}>
            {row.original.active}
          </Badge>
        </div>
      ),
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: "completed",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t(K.superadmin.queues.completed)}
        />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span className="text-sm text-text-secondary">
            {row.original.completed.toLocaleString()}
          </span>
        </div>
      ),
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: "failed",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t(K.superadmin.queues.failed)}
        />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            variant={row.original.failed > 0 ? "destructive" : "secondary"}
          >
            {row.original.failed}
          </Badge>
        </div>
      ),
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: "actions",
      header: () => (
        <span className="sr-only">{t(K.superadmin.queues.actions)}</span>
      ),
      cell: ({ row }) => {
        const q = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={q.failed === 0 || isPending}
              onClick={() => onRetry(q.name)}
              className="gap-1.5 h-7 text-xs"
            >
              <ArrowsClockwise size={13} />
              {t(K.superadmin.queues.retryFailed)}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={q.failed === 0 || isPending}
              onClick={() => onPurge(q.name)}
              className="gap-1.5 h-7 text-xs"
            >
              <Trash size={13} />
              {t(K.superadmin.queues.purgeFailed)}
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
    },
  ];
}

export default function QueuesPage() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileAdminQueues />;
  return <QueuesDesktop />;
}

function QueuesDesktop() {
  const t = useT();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.superadmin.queues(),
    queryFn: () => superadminApi.getQueues(),
    refetchInterval: 10000,
  });

  const retryMutation = useMutation({
    mutationFn: (name: string) => superadminApi.retryFailed(name),
    onSuccess: (result, name) => {
      toast.success(
        t(K.superadmin.toast.retriedJobs, {
          count: String(result.retried),
          name,
        }),
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.queues(),
      });
    },
    onError: () => toast.error(t(K.superadmin.toast.retryFailed)),
  });

  const purgeMutation = useMutation({
    mutationFn: (name: string) => superadminApi.purgeFailed(name),
    onSuccess: (result, name) => {
      toast.success(
        t(K.superadmin.toast.purgedJobs, {
          count: String(result.purged),
          name,
        }),
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.queues(),
      });
    },
    onError: () => toast.error(t(K.superadmin.toast.purgeFailed)),
  });

  const queues = data?.queues ?? [];
  const isPending = retryMutation.isPending || purgeMutation.isPending;

  const columns = useMemo(
    () =>
      getQueueColumns({
        onRetry: retryMutation.mutate,
        onPurge: purgeMutation.mutate,
        isPending,
        t,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPending, t],
  );

  const table = useReactTable({
    data: queues,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t(K.superadmin.queues.title)}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {isLoading
              ? t(K.superadmin.queues.subtitle)
              : `${t(K.superadmin.queues.subtitle)} · ${queues.length} queues · auto-refreshes every 10s`}
          </p>
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <DataTable table={table}>
            <DataTableToolbar table={table} />
          </DataTable>
        )}
      </div>
    </div>
  );
}
