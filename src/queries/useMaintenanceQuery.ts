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

export interface VisibilityFlags {
  googleSheets: boolean;
  googleDriveServiceAccount: boolean;
  googleDriveOAuth2: boolean;
  followUps: boolean;
}

interface MaintenanceConfig {
  maintenanceMode: boolean;
  maintenanceBanner: string;
  featureFlags: FeatureFlags;
  visibilityFlags: VisibilityFlags;
}

const DEFAULT_FLAGS: FeatureFlags = {
  knowledgeBase: true,
  broadcast: true,
  commandMenu: true,
  followUp: true,
};

const DEFAULT_VISIBILITY: VisibilityFlags = {
  googleSheets: true,
  googleDriveServiceAccount: true,
  googleDriveOAuth2: true,
  followUps: true,
};

const DEFAULT_BANNER = "System under maintenance — read-only mode active.";

const DEFAULT_CONFIG: MaintenanceConfig = {
  maintenanceMode: false,
  maintenanceBanner: DEFAULT_BANNER,
  featureFlags: DEFAULT_FLAGS,
  visibilityFlags: DEFAULT_VISIBILITY,
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
      const visibilityFlags: VisibilityFlags = {
        googleSheets:              data['visibility.feature.googleSheets']              !== 'false',
        googleDriveServiceAccount: data['visibility.feature.googleDriveServiceAccount'] !== 'false',
        googleDriveOAuth2:         data['visibility.feature.googleDriveOAuth2']         !== 'false',
        followUps:                 data['visibility.feature.followUps']                 !== 'false',
      };
      return {
        maintenanceMode: data["system.maintenanceMode"] === "true",
        maintenanceBanner: data["system.maintenanceBanner"] ?? DEFAULT_BANNER,
        featureFlags,
        visibilityFlags,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    placeholderData: DEFAULT_CONFIG,
  });
}

/**
 * Returns feature visibility flags from the public system config.
 * Default: all features visible (true) if no DB row is set.
 * Superadmin should always render features regardless of these flags.
 */
export function useFeatureVisibility(): VisibilityFlags {
  const { data } = useMaintenanceConfig();
  return data?.visibilityFlags ?? DEFAULT_VISIBILITY;
}
