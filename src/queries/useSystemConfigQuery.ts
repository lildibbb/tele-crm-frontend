import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { systemConfigApi } from "@/lib/api/systemConfig";
import type { SystemConfigEntry } from "@/lib/schemas/systemConfig.schema";
import { parseApiData } from "@/lib/api/parseResponse";

export function useSystemConfig() {
  return useQuery({
    queryKey: queryKeys.systemConfig.entries(),
    queryFn: async () => {
      const res = await systemConfigApi.findAll();
      const raw = parseApiData<SystemConfigEntry[]>(res.data) ?? [];
      const entries: Record<string, string> = {};
      for (const e of raw) entries[e.key] = e.value;
      return entries;
    },
  });
}

export function useUpsertSystemConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      systemConfigApi.upsert(key, { value }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.systemConfig.all });
    },
  });
}

export function useUpsertManySystemConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Record<string, string>) =>
      Promise.all(
        Object.entries(updates).map(([key, value]) =>
          systemConfigApi.upsert(key, { value })
        )
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.systemConfig.all });
    },
  });
}
