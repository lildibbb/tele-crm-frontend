import { apiClient } from "./apiClient";
import type {
  SystemConfigEntry,
  UpsertSystemConfigInput,
} from "@/lib/schemas/systemConfig.schema";
import type { ApiResponse } from "@/lib/schemas/common";

export const systemConfigApi = {
  /**
   * List all allowed config keys.
   */
  getAllowlist: () =>
    apiClient.get<ApiResponse<string[]>>("/system-config/allowlist"),

  /**
   * List all system config entries.
   */
  findAll: () =>
    apiClient.get<ApiResponse<SystemConfigEntry[]>>("/system-config"),

  /**
   * Get a single config entry by key (e.g. "ai.similarityThreshold").
   */
  findOne: (key: string) =>
    apiClient.get<ApiResponse<SystemConfigEntry>>(`/system-config/${key}`),

  /**
   * Upsert a config value — validated against the allowlist.
   */
  upsert: (key: string, data: UpsertSystemConfigInput) =>
    apiClient.patch<ApiResponse<SystemConfigEntry>>(`/system-config/${key}`, data),

  /**
   * Reset a config key to its env default (removes DB override). Returns 204 No Content.
   */
  remove: (key: string) =>
    apiClient.delete<void>(`/system-config/${key}`),
};
