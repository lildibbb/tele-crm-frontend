import { apiClient } from "./apiClient";
import type { ApiResponse } from "@/lib/schemas/common";
import type { SecretMeta } from "./superadmin";

/** Owner/Admin integration credentials endpoint — limited to Google keys only */
export const integrationsApi = {
  listCredentials: () =>
    apiClient.get<ApiResponse<SecretMeta[]>>("/settings/integrations/credentials"),

  setCredential: (data: { key: string; value: string; description?: string }) =>
    apiClient.post<void>("/settings/integrations/credentials", data),
};
