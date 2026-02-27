import { create } from 'zustand';
import { apiClient } from '@/lib/api/apiClient';
import type { ApiResponse } from '@/lib/schemas/common';

interface FeatureFlags {
  knowledgeBase: boolean;
  broadcast: boolean;
  commandMenu: boolean;
  followUp: boolean;
}

interface MaintenanceState {
  maintenanceMode: boolean;
  maintenanceBanner: string;
  featureFlags: FeatureFlags;
  isLoaded: boolean;
  fetchPublicConfig: () => Promise<void>;
}

const DEFAULT_FLAGS: FeatureFlags = {
  knowledgeBase: true,
  broadcast: true,
  commandMenu: true,
  followUp: true,
};

const DEFAULT_BANNER = 'System under maintenance — read-only mode active.';

export const useMaintenanceStore = create<MaintenanceState>((set) => ({
  maintenanceMode: false,
  maintenanceBanner: DEFAULT_BANNER,
  featureFlags: DEFAULT_FLAGS,
  isLoaded: false,

  fetchPublicConfig: async () => {
    try {
      const res = await apiClient.get<ApiResponse<Record<string, string>>>(
        '/system-config/public',
      );
      const data = res.data?.data ?? {};

      const featureFlags: FeatureFlags = {
        knowledgeBase: data['feature.knowledgeBase.enabled'] !== 'false',
        broadcast: data['feature.broadcast.enabled'] !== 'false',
        commandMenu: data['feature.commandMenu.enabled'] !== 'false',
        followUp: data['followUp.enabled'] !== 'false',
      };

      set({
        maintenanceMode: data['system.maintenanceMode'] === 'true',
        maintenanceBanner: data['system.maintenanceBanner'] ?? DEFAULT_BANNER,
        featureFlags,
        isLoaded: true,
      });
    } catch {
      // On failure keep defaults — don't block the UI
      set({ isLoaded: true });
    }
  },
}));
