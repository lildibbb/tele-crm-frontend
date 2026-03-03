import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { superadminApi } from "@/lib/api/superadmin";
import { analyticsApi } from "@/lib/api/analytics";
import { auditLogsApi } from "@/lib/api/auditLogs";
import type { CreateUserInput, ChangeRoleInput } from "@/lib/schemas/user.schema";
import type { ListAuditLogsParams } from "@/lib/schemas/auditLog.schema";
import type { ChangePasswordInput } from "@/lib/schemas/auth.schema";
import { parseApiData } from "@/lib/api/parseResponse";
import type { UserResponse } from "@/lib/schemas/user.schema";
import type { AuditLog } from "@/lib/schemas/auditLog.schema";
import type { RagStatsParams } from "@/lib/schemas/analytics.schema";

export function useSuperadminUsers() {
  return useQuery({
    queryKey: queryKeys.superadmin.users(),
    queryFn: async () => {
      const res = await superadminApi.findAllUsers();
      const raw = parseApiData<UserResponse[] | Record<string, UserResponse[]>>(res.data);
      return Array.isArray(raw)
        ? raw
        : (raw as Record<string, UserResponse[]>)?.items ??
            (raw as Record<string, UserResponse[]>)?.data ??
            [];
    },
  });
}

export function useSuperadminAuditLogs(params?: ListAuditLogsParams) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list((params ?? {}) as Record<string, unknown>),
    queryFn: async () => {
      const res = await auditLogsApi.findMany(params);
      const rawLogs = parseApiData<AuditLog[] | Record<string, AuditLog[]>>(res.data);
      return Array.isArray(rawLogs)
        ? rawLogs
        : (rawLogs as Record<string, AuditLog[]>)?.items ??
            (rawLogs as Record<string, AuditLog[]>)?.data ??
            [];
    },
  });
}

export function useSuperadminRagStats(params?: RagStatsParams) {
  return useQuery({
    queryKey: queryKeys.superadmin.ragStats((params ?? {}) as Record<string, unknown>),
    queryFn: async () => {
      const res = await analyticsApi.getRagStats(params);
      return res.data.data;
    },
  });
}

export function useSuperadminQueues() {
  return useQuery({
    queryKey: queryKeys.superadmin.queues(),
    queryFn: () => superadminApi.getQueues(),
  });
}

export function useSuperadminTokenUsage() {
  return useQuery({
    queryKey: queryKeys.superadmin.tokenUsage(),
    queryFn: () => superadminApi.getTokenUsage(),
  });
}

export function useSuperadminKbHealth() {
  return useQuery({
    queryKey: queryKeys.superadmin.kbHealth(),
    queryFn: () => superadminApi.getKbHealth(),
  });
}

export function useSuperadminSystemHealth() {
  return useQuery({
    queryKey: queryKeys.superadmin.systemHealth(),
    queryFn: () => superadminApi.getSystemHealth(),
    refetchInterval: 15_000,
  });
}

export function useCreateSuperadminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) => superadminApi.createUser(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.users() });
    },
  });
}

export function useDeactivateSuperadminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => superadminApi.deactivateUser(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.users() });
    },
  });
}

export function useReactivateSuperadminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => superadminApi.reactivateUser(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.users() });
    },
  });
}

export function useChangeSuperadminUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeRoleInput }) =>
      superadminApi.changeUserRole(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.users() });
    },
  });
}

export function useForceSuperadminPasswordChange() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePasswordInput }) =>
      superadminApi.forcePasswordChange(id, data),
  });
}
