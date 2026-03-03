import { apiClient } from "./apiClient";
import type {
  UserResponse,
  CreateUserInput,
  ChangeRoleInput,
} from "@/lib/schemas/user.schema";
import type { ChangePasswordInput } from "@/lib/schemas/auth.schema";
import type { ApiResponse } from "@/lib/schemas/common";

// ── Backup ────────────────────────────────────────────────────────────────────

export type BackupStatus = "success" | "partial" | "failed";

export interface BackupLog {
  id: string;
  filename: string;
  sizeBytes: number;
  destinations: string[];
  status: BackupStatus;
  error: string | null;
  createdAt: string;
}

// ── Secrets ───────────────────────────────────────────────────────────────────

export interface SecretMeta {
  key: string;
  description: string | null;
  updatedBy: string | null;
  updatedAt: string;
}

export interface QueueJobCount {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}
export interface QueueStats { queues: QueueJobCount[] }

export interface AdminSession {
  id: string;
  userId: string;
  deviceId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  lastActiveAt: string;
  createdAt: string;
  expiresAt: string;
  isRevoked: boolean;
}

export interface TokenDay { date: string; tokens: number; estimatedCostUsd: number }
export interface TokenUsageData {
  daily: TokenDay[];
  rolling30dTokens: number;
  rolling30dCostUsd: number;
}

export interface KbHealthData {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  embeddingCoverage: { total: number; embedded: number };
}

export type HealthStatus = 'ok' | 'degraded' | 'down';

export interface SystemHealthCheck {
  name: string;
  status: HealthStatus;
  latencyMs?: number;
  details?: unknown;
}

export interface SystemHealthData {
  status: HealthStatus;
  checks: SystemHealthCheck[];
  timestamp: string;
}

/**
 * Superadmin-only API endpoints for system administration.
 * These endpoints require SUPERADMIN role.
 */
export const superadminApi = {
  /**
   * Returns all CRM system users. Requires SUPERADMIN role.
   */
  findAllUsers: () =>
    apiClient.get<ApiResponse<UserResponse[]>>("/superadmin/users"),

  /**
   * Directly creates a CRM user without an invitation (SUPERADMIN only).
   */
  createUser: (data: CreateUserInput) =>
    apiClient.post<ApiResponse<UserResponse>>("/superadmin/users", data),

  /**
   * Returns a specific user by UUID (SUPERADMIN only).
   */
  findUserById: (id: string) =>
    apiClient.get<ApiResponse<UserResponse>>(`/superadmin/users/${id}`),

  /**
   * Deactivates the user and instantly revokes all their sessions (SUPERADMIN only).
   */
  deactivateUser: (id: string) =>
    apiClient.delete<void>(`/superadmin/users/${id}`),

  /**
   * Resets a user's password and revokes all their sessions (SUPERADMIN only).
   */
  forcePasswordChange: (id: string, data: ChangePasswordInput) =>
    apiClient.patch<void>(`/superadmin/users/${id}/change-password`, data),

  /**
   * Re-enables a deactivated user and clears their Redis block (SUPERADMIN only).
   */
  reactivateUser: (id: string) =>
    apiClient.patch<ApiResponse<UserResponse>>(`/superadmin/users/${id}/reactivate`),

  /**
   * Updates a user's role. Cannot change own role (SUPERADMIN only).
   */
  changeUserRole: (id: string, data: ChangeRoleInput) =>
    apiClient.patch<ApiResponse<UserResponse>>(`/superadmin/users/${id}/role`, data),

  getQueues: async (): Promise<QueueStats> => {
    const res = await apiClient.get<ApiResponse<QueueStats>>('/superadmin/queues');
    return res.data.data;
  },
  retryFailed: async (name: string): Promise<{ retried: number }> => {
    const res = await apiClient.post<ApiResponse<{ retried: number }>>(`/superadmin/queues/${name}/retry-failed`);
    return res.data.data;
  },
  purgeFailed: async (name: string): Promise<{ purged: number }> => {
    const res = await apiClient.delete<ApiResponse<{ purged: number }>>(`/superadmin/queues/${name}/failed`);
    return res.data.data;
  },
  listSessions: async (): Promise<AdminSession[]> => {
    const res = await apiClient.get<ApiResponse<AdminSession[]>>('/superadmin/sessions');
    return res.data.data;
  },
  revokeSession: async (id: string): Promise<void> => {
    await apiClient.delete(`/superadmin/sessions/${id}`);
  },
  getTokenUsage: async (): Promise<TokenUsageData> => {
    const res = await apiClient.get<ApiResponse<TokenUsageData>>('/superadmin/token-usage');
    return res.data.data;
  },
  getKbHealth: async (): Promise<KbHealthData> => {
    const res = await apiClient.get<ApiResponse<KbHealthData>>('/superadmin/kb-health');
    return res.data.data;
  },
  getSystemHealth: async (): Promise<SystemHealthData> => {
    const res = await apiClient.get<ApiResponse<SystemHealthData>>('/superadmin/system-health');
    return res.data.data;
  },

  // ── Backup ───────────────────────────────────────────────────────────────

  triggerBackup: () =>
    apiClient.post<ApiResponse<{ message: string }>>("/superadmin/backup/trigger"),

  getBackupHistory: (limit = 10) =>
    apiClient.get<ApiResponse<BackupLog[]>>(`/superadmin/backup/history?limit=${limit}`),

  // ── Secrets ──────────────────────────────────────────────────────────────

  listSecrets: () =>
    apiClient.get<ApiResponse<SecretMeta[]>>("/superadmin/secrets"),

  setSecret: (data: { key: string; value: string; description?: string }) =>
    apiClient.post<void>("/superadmin/secrets", data),

  deleteSecret: (key: string) =>
    apiClient.delete<void>(`/superadmin/secrets/${key}`),
};
