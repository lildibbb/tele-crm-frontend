import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { apiClient } from "@/lib/api/apiClient";
import type { ApiResponse } from "@/lib/schemas/common";

// ── Interfaces ─────────────────────────────────────────────────────────────────

interface FeatureFlags {
  readonly knowledgeBase: boolean;
  readonly broadcast: boolean;
  readonly commandMenu: boolean;
  readonly followUp: boolean;
}

export interface VisibilityFlags {
  readonly googleSheets: boolean;
  readonly googleDriveServiceAccount: boolean;
  readonly googleDriveOAuth2: boolean;
  readonly followUps: boolean;
}

/** VisibilityFlags extended with a loading sentinel for FOUC prevention. */
export type VisibilityState = VisibilityFlags & { readonly isLoading: boolean };

interface MaintenanceConfig {
  readonly maintenanceMode: boolean;
  readonly maintenanceBanner: string;
  readonly featureFlags: FeatureFlags;
  readonly visibilityFlags: VisibilityFlags;
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_FLAGS: FeatureFlags = {
  knowledgeBase: true,
  broadcast: true,
  commandMenu: true,
  followUp: true,
};

/**
 * All visibility flags default to FALSE so the placeholder data hides
 * feature-gated UI during the initial fetch (prevents FOUC on hard refresh).
 * The real API response sets them to true when the DB key is absent (first-time
 * setup) or explicitly "true".
 */
const DEFAULT_VISIBILITY: VisibilityFlags = {
  googleSheets: false,
  googleDriveServiceAccount: false,
  googleDriveOAuth2: false,
  followUps: false,
};

const DEFAULT_BANNER = "System under maintenance — read-only mode active.";

const DEFAULT_CONFIG: MaintenanceConfig = {
  maintenanceMode: false,
  maintenanceBanner: DEFAULT_BANNER,
  featureFlags: DEFAULT_FLAGS,
  visibilityFlags: DEFAULT_VISIBILITY,
};

// ── Queries ────────────────────────────────────────────────────────────────────

export function useMaintenanceConfig() {
  return useQuery({
    queryKey: queryKeys.maintenance.publicConfig(),
    queryFn: async (): Promise<MaintenanceConfig> => {
      const res = await apiClient.get<ApiResponse<Record<string, string>>>(
        "/system-config/public",
      );
      const raw = res.data?.data ?? {};

      const featureFlags: FeatureFlags = {
        knowledgeBase: raw["feature.knowledgeBase.enabled"] !== "false",
        broadcast: raw["feature.broadcast.enabled"] !== "false",
        commandMenu: raw["feature.commandMenu.enabled"] !== "false",
        followUp: raw["followUp.enabled"] !== "false",
      };

      const visibilityFlags: VisibilityFlags = {
        googleSheets: raw["visibility.feature.googleSheets"] !== "false",
        googleDriveServiceAccount:
          raw["visibility.feature.googleDriveServiceAccount"] !== "false",
        googleDriveOAuth2: raw["visibility.feature.googleDriveOAuth2"] !== "false",
        followUps: raw["visibility.feature.followUps"] !== "false",
      };

      return {
        maintenanceMode: raw["system.maintenanceMode"] === "true",
        maintenanceBanner: raw["system.maintenanceBanner"] ?? DEFAULT_BANNER,
        featureFlags,
        visibilityFlags,
      };
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
    placeholderData: DEFAULT_CONFIG,
  });
}

/**
 * Returns feature visibility flags plus an `isLoading` sentinel.
 *
 * `isLoading` is `true` while placeholder data is in use (initial network
 * fetch in flight). Components can use it to render skeletons instead of
 * abruptly hiding/showing gated UI.
 *
 * Superadmin callers should ignore these flags entirely and always render all
 * features — enforcement is the responsibility of each consumer.
 */
export function useFeatureVisibility(): VisibilityState {
  const { data, isPlaceholderData } = useMaintenanceConfig();
  return {
    ...(data?.visibilityFlags ?? DEFAULT_VISIBILITY),
    isLoading: isPlaceholderData,
  };
}
