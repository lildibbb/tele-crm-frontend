import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { leadsApi } from "@/lib/api/leads";
import type { Lead, UpdateLeadStatusInput } from "@/lib/schemas/lead.schema";
import { LeadStatus } from "@/types/enums";
import { parseApiData } from "@/lib/api/parseResponse";

// Re-export for convenience
export type { Lead };
export { LeadStatus };

// ── State & Actions ────────────────────────────────────────────────────────

interface LeadsState {
  leads: Lead[];
  total: number;
  isLoading: boolean;
  error: string | null;
  pageCount: number;
}

interface LeadsActions {
  // Async API actions
  fetchLeads: (params: {
    skip: number;
    take: number;
    status?: string;
    statuses?: string;
    search?: string;
    orderBy?: string;
    order?: "asc" | "desc";
    contactId?: string;
    registered?: boolean;
    balanceMin?: number;
    balanceMax?: number;
  }) => Promise<void>;
  fetchLead: (id: string) => Promise<void>;
  updateStatus: (id: string, data: UpdateLeadStatusInput) => Promise<void>;
  setHandover: (id: string, mode: boolean) => Promise<void>;
  bulkSetHandover: (mode: boolean) => Promise<void>;
  verifyLead: (id: string) => void;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useLeadsStore = create<LeadsState & LeadsActions>()(
  devtools(
    (set, get) => ({
      leads: [],
      total: 0,
      isLoading: false,
      error: null,
      pageCount: 1,

      fetchLeads: async ({
        skip,
        take,
        status,
        statuses,
        search,
        orderBy,
        order,
        contactId,
        registered,
        balanceMin,
        balanceMax,
      }) => {
        set({ isLoading: true, error: null }, false, "fetchLeads/pending");
        try {
          const res = await leadsApi.list({
            skip,
            take,
            status: status as LeadStatus | undefined,
            statuses,
            search,
            orderBy,
            order,
            contactId,
            registered,
            balanceMin,
            balanceMax,
          });
          const payload = parseApiData<{ data: Lead[]; meta?: { total?: number } } | Lead[]>(res.data);
          const data = Array.isArray(payload) ? payload : (payload?.data ?? []);
          const apiTotal = Array.isArray(payload) ? undefined : payload?.meta?.total;
          // When API doesn't return `total`, estimate from response size:
          //   partial page (< take items) → this is the last page → total = skip + count
          //   full page (= take items)   → more pages likely exist → assume at least 1 more
          const resolvedTotal =
            apiTotal !== undefined
              ? apiTotal
              : data.length < take
                ? (skip ?? 0) + data.length
                : (skip ?? 0) + data.length + 1;
          set(
            {
              leads: data,
              total: resolvedTotal,
              pageCount: Math.max(1, Math.ceil(resolvedTotal / take)),
              isLoading: false,
            },
            false,
            "fetchLeads/success",
          );
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load leads.";
          set({ isLoading: false, error: message }, false, "fetchLeads/error");
        }
      },

      fetchLead: async (id: string) => {
        set({ isLoading: true, error: null }, false, "fetchLead/pending");
        try {
          const res = await leadsApi.findOne(id);
          const data = res.data.data;
          set(
            (s) => {
              const exists = s.leads.some((l) => l.id === id);
              return {
                leads: exists
                  ? s.leads.map((l) => (l.id === id ? data : l))
                  : [...s.leads, data],
                isLoading: false,
              };
            },
            false,
            "fetchLead/success",
          );
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load lead.";
          set({ isLoading: false, error: message }, false, "fetchLead/error");
        }
      },

      updateStatus: async (id: string, data: UpdateLeadStatusInput) => {
        try {
          const res = await leadsApi.updateStatus(id, data);
          const updated = res.data.data;
          set(
            (s) => ({ leads: s.leads.map((l) => (l.id === id ? updated : l)) }),
            false,
            "updateStatus/success",
          );
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to update lead status.";
          set({ error: message }, false, "updateStatus/error");
          throw err;
        }
      },

      setHandover: async (id: string, mode: boolean) => {
        try {
          const res = await leadsApi.setHandover(id, { handoverMode: mode });
          const updated = res.data.data;
          set(
            (s) => ({ leads: s.leads.map((l) => (l.id === id ? updated : l)) }),
            false,
            "setHandover/success",
          );
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to update handover mode.";
          set({ error: message }, false, "setHandover/error");
          throw err;
        }
      },

      bulkSetHandover: async (mode: boolean) => {
        const leads = get().leads;
        // Optimistically update all leads in store
        set(
          (s) => ({
            leads: s.leads.map((l) => ({ ...l, handoverMode: mode })),
          }),
          false,
          "bulkSetHandover/optimistic",
        );
        try {
          await leadsApi.setBulkHandover({
            handoverMode: mode,
          });
        } catch (err: unknown) {
          console.error("Failed to set bulk handover", err);
        }
      },

      verifyLead: (id: string) => {
        // Pure local state update — the actual API call is made by verificationStore.verify().
        // Applying optimistic status/verifiedAt so other views reflect the change immediately.
        set(
          (s) => ({
            leads: s.leads.map((l) =>
              l.id === id
                ? { ...l, status: "DEPOSIT_CONFIRMED" as typeof l.status, verifiedAt: new Date().toISOString() }
                : l,
            ),
          }),
          false,
          "verifyLead/success",
        );
      },
    }),
    { name: "leads-store" },
  ),
);
