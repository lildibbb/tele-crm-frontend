'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { superadminApi } from '@/lib/api/superadmin';
import { queryKeys } from '@/queries/queryKeys';
import { ProhibitInset } from '@phosphor-icons/react';

function truncate(str: string, len = 12) {
  return str.length <= len ? str : `${str.slice(0, len)}…`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function AdminSessionsPage() {
  const queryClient = useQueryClient();
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: queryKeys.superadmin.sessions(),
    queryFn: () => superadminApi.listSessions(),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => superadminApi.revokeSession(id),
    onSuccess: (_, id) => {
      toast.success(`Session ${truncate(id)} revoked`);
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.sessions() });
      setRevokeId(null);
    },
    onError: () => toast.error('Failed to revoke session'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Active Sessions</h1>
        <p className="text-sm text-text-secondary mt-1">
          All active user sessions across the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Sessions{!isLoading && ` (${sessions.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead>User Agent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState title="No active sessions" />
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs text-text-secondary" title={s.id}>
                      {truncate(s.id, 16)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-secondary" title={s.userId}>
                      {truncate(s.userId, 16)}
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary whitespace-nowrap">
                      {formatDate(s.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary whitespace-nowrap">
                      {formatDate(s.expiresAt)}
                    </TableCell>
                    <TableCell className="text-xs text-text-secondary max-w-[200px] truncate" title={s.userAgent ?? undefined}>
                      {s.userAgent ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setRevokeId(s.id)}
                        className="gap-1.5"
                      >
                        <ProhibitInset size={14} />
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!revokeId} onOpenChange={(open) => { if (!open) setRevokeId(null); }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Session</AlertDialogTitle>
            <AlertDialogDescription>
              This session will be terminated immediately. The user will need to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revokeId && revokeMutation.mutate(revokeId)}
              disabled={revokeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
