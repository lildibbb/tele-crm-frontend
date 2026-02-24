import { apiClient } from "./apiClient";
import type {
  AuditLog,
  ListAuditLogsParams,
} from "@/lib/schemas/auditLog.schema";
import type { ApiResponse } from "@/lib/schemas/common";

export const auditLogsApi = {
  /**
   * Query audit log entries. SUPERADMIN only.
   * Supports filtering by userId, action, resourceType, date range, and pagination.
   */
  findMany: (params?: ListAuditLogsParams) =>
    apiClient.get<ApiResponse<AuditLog[]>>("/audit-logs", { params }),
};
