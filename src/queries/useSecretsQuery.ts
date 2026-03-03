import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { superadminApi } from "@/lib/api/superadmin";
import type { SecretMeta } from "@/lib/api/superadmin";
import { parseApiData } from "@/lib/api/parseResponse";

export function useSecretsList() {
  return useQuery({
    queryKey: queryKeys.secrets.list(),
    queryFn: async () => {
      const res = await superadminApi.listSecrets();
      return parseApiData<SecretMeta[]>(res.data) ?? [];
    },
  });
}

export function useSetSecret() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      key,
      value,
      description,
    }: {
      key: string;
      value: string;
      description?: string;
    }) => superadminApi.setSecret({ key, value, description }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.secrets.all });
    },
  });
}

export function useDeleteSecret() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => superadminApi.deleteSecret(key),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.secrets.all });
    },
  });
}
