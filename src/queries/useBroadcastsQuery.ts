import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { broadcastApi, type BroadcastInput } from "@/lib/api/broadcast";
import { parseApiData } from "@/lib/api/parseResponse";
import type { BroadcastLog } from "@/lib/api/broadcast";

export function useBroadcastHistory(params: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 20 } = params;
  return useQuery({
    queryKey: queryKeys.broadcasts.history({ page, limit } as Record<string, unknown>),
    queryFn: async () => {
      const res = await broadcastApi.history({ page, limit });
      const payload = parseApiData<{ data: BroadcastLog[]; total: number }>(res.data);
      return {
        data: payload?.data ?? [],
        total: payload?.total ?? 0,
      };
    },
    placeholderData: (prev) => prev,
  });
}

export function useSendBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BroadcastInput) => broadcastApi.send(input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.broadcasts.all });
    },
  });
}
