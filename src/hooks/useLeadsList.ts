import { useCallback } from "react";
import { useLeadsStore } from "@/store/leadsStore";

interface UseLeadsListOptions {
  skip?: number;
  take?: number;
  search?: string;
  status?: string;
  orderBy?: string;
  order?: "asc" | "desc";
}

export function useLeadsList(initialOptions: UseLeadsListOptions = {}) {
  const { leads, total, isLoading, fetchLeads } = useLeadsStore();

  const load = useCallback(
    (opts: UseLeadsListOptions) => {
      fetchLeads({
        skip: opts.skip ?? 0,
        take: opts.take ?? 20,
        status: opts.status,
        search: opts.search || undefined,
        orderBy: opts.orderBy ?? "createdAt",
        order: opts.order ?? "desc",
      });
    },
    [fetchLeads],
  );

  return { leads, total, isLoading, load };
}
