import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { apiClient } from "@/lib/api/apiClient";
import type { ApiResponse } from "@/lib/schemas/common";

interface FeatureFlags {
  knowledgeBase: boolean;
  broadcast: boolean;
  commandMenu: boolean;
  followUp: boolean;
}

interface MaintenanceConfig {
  maintenanceMode: boolean;
  maintenanceBanner: string;
  featureFlags: FeatureFlags;
}

const DEFAULT_FLAGS: FeatureFlags = {
  knowledgeBase: true,
  broadcast: true,
  commandMenu: true,
  followUp: true,
};

const DEFAULT_BANNER = "System under maintenance — read-only mode active.";

const DEFAULT_CONFIG: MaintenanceConfig = {
  maintenanceMode: false,
  maintenanceBanner: DEFAULT_BANNER,
  featureFlags: DEFAULT_FLAGS,
};

export function useMaintenanceConfig() {
  return useQuery({
    queryKey: queryKeys.maintenance.publicConfig(),
    queryFn: async (): Promise<MaintenanceConfig> => {
      const res = await apiClient.get<ApiResponse<Record<string, string>>>("/system-config/public");
      const data = res.data?.data ?? {};
      const featureFlags: FeatureFlags = {
        knowledgeBase: data["feature.knowledgeBase.enabled"] !== "false",
        broadcast: data["feature.broadcast.enabled"] !== "false",
        commandMenu: data["feature.commandMenu.enabled"] !== "false",
        followUp: data["followUp.enabled"] !== "false",
      };
      return {
        maintenanceMode: data["system.maintenanceMode"] === "true",
        maintenanceBanner: data["system.maintenanceBanner"] ?? DEFAULT_BANNER,
        featureFlags,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    placeholderData: DEFAULT_CONFIG,
  });
}
