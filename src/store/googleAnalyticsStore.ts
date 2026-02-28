import { create } from "zustand";
import { googleAnalyticsApi, type GoogleAnalyticsResult } from "@/lib/api/googleAnalytics";

interface GoogleAnalyticsState {
  data: GoogleAnalyticsResult | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export const useGoogleAnalyticsStore = create<GoogleAnalyticsState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await googleAnalyticsApi.getAnalytics();
      const result = (res.data as any).data as GoogleAnalyticsResult;
      set({ data: result, isLoading: false });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to load";
      set({ error: msg, isLoading: false });
    }
  },
}));
