import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { leadsApi } from "@/lib/api/leads";
import type { UpdateLeadStatusInput } from "@/lib/schemas/lead.schema";
import { LeadStatus } from "@/types/enums";
import { parseApiData } from "@/lib/api/parseResponse";
import type { Lead } from "@/lib/schemas/lead.schema";

export type { Lead };
export { LeadStatus };

export interface LeadsListParams {
  skip?: number;
  take?: number;
  status?: string;
  statuses?: string;
  search?: string;
  orderBy?: string;
  order?: "asc" | "desc";
  contactId?: string;
  registered?: boolean;
  balanceMin?: number;
  balanceMax?: number;
}

export function useLeadsList(params: LeadsListParams = {}) {
  return useQuery({
    queryKey: queryKeys.leads.list(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await leadsApi.list({
        skip: params.skip ?? 0,
        take: params.take ?? 20,
        status: params.status as LeadStatus | undefined,
        statuses: params.statuses,
        search: params.search,
        orderBy: params.orderBy,
        order: params.order,
        contactId: params.contactId,
        registered: params.registered,
        balanceMin: params.balanceMin,
        balanceMax: params.balanceMax,
      });
      const payload = parseApiData<{ data: Lead[]; meta?: { total?: number } } | Lead[]>(res.data);
      const data = Array.isArray(payload) ? payload : (payload?.data ?? []);
      const take = params.take ?? 20;
      const skip = params.skip ?? 0;
      const apiTotal = Array.isArray(payload) ? undefined : payload?.meta?.total;
      const resolvedTotal =
        apiTotal !== undefined
          ? apiTotal
          : data.length < take
            ? skip + data.length
            : skip + data.length + 1;
      return {
        data,
        total: resolvedTotal,
        pageCount: Math.max(1, Math.ceil(resolvedTotal / take)),
      };
    },
    placeholderData: (prev) => prev,
  });
}

export function useLeadDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: async () => {
      const res = await leadsApi.findOne(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadStatusInput }) =>
      leadsApi.updateStatus(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}

export function useSetHandover() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: boolean }) =>
      leadsApi.setHandover(id, { handoverMode: mode }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}

export function useBulkSetHandover() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mode: boolean) => leadsApi.setBulkHandover({ handoverMode: mode }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}

export function useVerifyLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsApi.verify(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}
