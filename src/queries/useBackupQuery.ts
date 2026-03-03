import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { superadminApi } from "@/lib/api/superadmin";
import type { BackupLog } from "@/lib/api/superadmin";
import { parseApiData } from "@/lib/api/parseResponse";

export function useBackupHistory(limit = 10) {
  return useQuery({
    queryKey: queryKeys.backup.history(limit),
    queryFn: async () => {
      const res = await superadminApi.getBackupHistory(limit);
      return parseApiData<BackupLog[]>(res.data) ?? [];
    },
  });
}

export function useTriggerBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => superadminApi.triggerBackup(),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backup.all });
    },
  });
}
