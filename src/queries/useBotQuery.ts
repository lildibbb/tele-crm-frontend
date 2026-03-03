import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { botApi } from "@/lib/api/bot";
import { parseApiData } from "@/lib/api/parseResponse";

export function useBotStatus() {
  return useQuery({
    queryKey: queryKeys.bot.status(),
    queryFn: async () => {
      const res = await botApi.getStatus();
      const connected = parseApiData<{ connected?: boolean }>(res.data)?.connected;
      return { online: connected === true, lastChecked: new Date() };
    },
    refetchInterval: 30_000,
    retry: false,
  });
}
