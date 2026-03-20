import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { kbApi } from "@/lib/api/kb";
import type {
  CreateKbInput,
  KbEntry,
  UpdateKbInput,
} from "@/lib/schemas/kb.schema";
import { KbStatus } from "@/types/enums";

export const KB_IN_FLIGHT_STATUSES: ReadonlySet<KbEntry["status"]> = new Set([
  KbStatus.PENDING,
  KbStatus.PROCESSING,
]);

export const KB_TERMINAL_STATUSES: ReadonlySet<KbEntry["status"]> = new Set([
  KbStatus.READY,
  KbStatus.FAILED,
]);

export function isKbInFlightStatus(status: KbEntry["status"]): boolean {
  return KB_IN_FLIGHT_STATUSES.has(status);
}

export function isKbTerminalStatus(status: KbEntry["status"]): boolean {
  return KB_TERMINAL_STATUSES.has(status);
}

export function shouldPollKbEntries(entries: KbEntry[]): boolean {
  return entries.some((entry) => isKbInFlightStatus(entry.status));
}

function upsertKbEntry(entries: KbEntry[], incoming: KbEntry): KbEntry[] {
  const existingIndex = entries.findIndex((entry) => entry.id === incoming.id);
  if (existingIndex === -1) {
    return [incoming, ...entries];
  }

  return entries.map((entry, index) => {
    if (index === existingIndex) {
      return incoming;
    }
    return entry;
  });
}

export function useKbList() {
  return useQuery<KbEntry[]>({
    queryKey: queryKeys.kb.list(),
    queryFn: async () => {
      const res = await kbApi.findAll();
      return res.data.data;
    },
    refetchInterval: (query) => {
      const entries = query.state.data ?? [];
      return shouldPollKbEntries(entries) ? 5000 : false;
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
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      const res = await kbApi.uploadFile(formData);
      return res.data.data;
    },
    onSuccess: (uploadedEntry) => {
      queryClient.setQueryData<KbEntry[]>(queryKeys.kb.list(), (current) => {
        const entries = current ?? [];
        return upsertKbEntry(entries, uploadedEntry);
      });
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

export function useRetryKb() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await kbApi.retryFailed(id);
      return res.data.data;
    },
    onSuccess: (retriedEntry) => {
      queryClient.setQueryData<KbEntry[]>(queryKeys.kb.list(), (current) => {
        const entries = current ?? [];
        return upsertKbEntry(entries, retriedEntry);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.kb.all,
        refetchType: "active",
      });
    },
  });
}
