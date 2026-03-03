import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { auditLogsApi } from "@/lib/api/auditLogs";
import type { ListAuditLogsParams } from "@/lib/schemas/auditLog.schema";
import { parseApiData } from "@/lib/api/parseResponse";
import type { AuditLog } from "@/lib/schemas/auditLog.schema";

export function useAuditLogs(params?: ListAuditLogsParams) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list((params ?? {}) as Record<string, unknown>),
    queryFn: async () => {
      const res = await auditLogsApi.findMany(params);
      const rawLogs = parseApiData<AuditLog[] | Record<string, AuditLog[]>>(res.data);
      const logs = Array.isArray(rawLogs)
        ? rawLogs
        : (rawLogs as Record<string, AuditLog[]>)?.items ??
          (rawLogs as Record<string, AuditLog[]>)?.data ??
          [];
      return logs;
    },
    placeholderData: (prev) => prev,
  });
}
