import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { kbApi } from "@/lib/api/kb";
import type { CreateKbInput, UpdateKbInput } from "@/lib/schemas/kb.schema";

export function useKbList() {
  return useQuery({
    queryKey: queryKeys.kb.list(),
    queryFn: async () => {
      const res = await kbApi.findAll();
      return res.data.data;
    },
  });
}

export function useKbActive() {
  return useQuery({
    queryKey: queryKeys.kb.active(),
    queryFn: async () => {
      const res = await kbApi.findActive();
      return res.data.data;
    },
  });
}

export function useCreateKbText() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKbInput) => kbApi.createText(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kb.all });
    },
  });
}

export function useUploadKbFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      return kbApi.uploadFile(formData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kb.all });
    },
  });
}

export function useUpdateKb() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKbInput }) =>
      kbApi.update(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kb.all });
    },
  });
}

export function useRemoveKb() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kbApi.remove(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kb.all });
    },
  });
}
