import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { googleAnalyticsApi, type GoogleAnalyticsResult } from "@/lib/api/googleAnalytics";
import { parseApiData } from "@/lib/api/parseResponse";

export function useGoogleAnalyticsStats() {
  return useQuery({
    queryKey: queryKeys.googleAnalytics.stats(),
    queryFn: async () => {
      const res = await googleAnalyticsApi.getAnalytics();
      return parseApiData<GoogleAnalyticsResult>(res.data);
    },
  });
}
