'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { superadminApi } from '@/lib/api/superadmin';
import { queryKeys } from '@/queries/queryKeys';
import { ArrowsClockwise, Trash } from '@phosphor-icons/react';

export default function QueuesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.superadmin.queues(),
    queryFn: () => superadminApi.getQueues(),
    refetchInterval: 10000,
  });

  const retryMutation = useMutation({
    mutationFn: (name: string) => superadminApi.retryFailed(name),
    onSuccess: (result, name) => {
      toast.success(`Retried ${result.retried} failed job(s) in "${name}"`);
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.queues() });
    },
    onError: () => toast.error('Failed to retry jobs'),
  });

  const purgeMutation = useMutation({
    mutationFn: (name: string) => superadminApi.purgeFailed(name),
    onSuccess: (result, name) => {
      toast.success(`Purged ${result.purged} failed job(s) from "${name}"`);
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.queues() });
    },
    onError: () => toast.error('Failed to purge jobs'),
  });

  const queues = data?.queues ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Queue Manager</h1>
        <p className="text-sm text-text-secondary mt-1">
          Monitor and manage background job queues · auto-refreshes every 10s
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Active Queues</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue Name</TableHead>
                <TableHead className="text-center">Waiting</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead className="text-center">Failed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : queues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState title="No queues found" />
                  </TableCell>
                </TableRow>
              ) : (
                queues.map((q) => (
                  <TableRow key={q.name}>
                    <TableCell className="font-medium font-mono text-sm">{q.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{q.waiting}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={q.active > 0 ? 'default' : 'secondary'}>{q.active}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-text-secondary">{q.completed}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={q.failed > 0 ? 'destructive' : 'secondary'}>{q.failed}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={q.failed === 0 || retryMutation.isPending || purgeMutation.isPending}
                          onClick={() => retryMutation.mutate(q.name)}
                          className="gap-1.5"
                        >
                          <ArrowsClockwise size={14} />
                          Retry Failed
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={q.failed === 0 || purgeMutation.isPending || retryMutation.isPending}
                          onClick={() => purgeMutation.mutate(q.name)}
                          className="gap-1.5"
                        >
                          <Trash size={14} />
                          Purge Failed
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
