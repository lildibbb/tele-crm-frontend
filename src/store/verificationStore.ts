import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { leadsApi } from "@/lib/api/leads";
import { useLeadsStore } from "./leadsStore";
import { LeadStatus } from "@/types/enums";

// ── Types ──────────────────────────────────────────────────────────────────

export type ModalKind = "approve" | "reject" | "askMore" | "receipt" | null;
export type FilterTab = "PENDING" | "ALL";

interface VerificationState {
  isLoading: boolean;
  error: string | null;
  filter: FilterTab;
  search: string;
  activeId: string | null;
  modalKind: ModalKind;
  rejectReason: string;
  askMoreText: string;
}

interface VerificationActions {
  setFilter: (filter: FilterTab) => void;
  setSearch: (search: string) => void;
  openModal: (id: string, kind: Exclude<ModalKind, null>) => void;
  closeModal: () => void;
  setRejectReason: (reason: string) => void;
  setAskMoreText: (text: string) => void;
  verify: (id: string) => Promise<void>;
  // Selectors (derive from leadsStore)
  getPendingVerifications: () => ReturnType<
    typeof useLeadsStore.getState
  >["leads"];
  getFiltered: () => ReturnType<typeof useLeadsStore.getState>["leads"];
  getActiveRequest: () =>
    | ReturnType<typeof useLeadsStore.getState>["leads"][0]
    | undefined;
  getVerifiedCount: () => number;
  getRejectedCount: () => number;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useVerificationStore = create<
  VerificationState & VerificationActions
>()(
  devtools(
    (set, get) => ({
      isLoading: false,
      error: null,
      filter: "PENDING",
      search: "",
      activeId: null,
      modalKind: null,
      rejectReason: "",
      askMoreText: "",

      setFilter: (filter) => set({ filter }, false, "setFilter"),
      setSearch: (search) => set({ search }, false, "setSearch"),

      openModal: (id, kind) =>
        set({ activeId: id, modalKind: kind }, false, "openModal"),

      closeModal: () =>
        set(
          {
            activeId: null,
            modalKind: null,
            rejectReason: "",
            askMoreText: "",
          },
          false,
          "closeModal",
        ),

      setRejectReason: (reason) => set({ rejectReason: reason }),
      setAskMoreText: (text) => set({ askMoreText: text }),

      verify: async (id: string) => {
        set({ isLoading: true, error: null }, false, "verify/pending");
        try {
          await leadsApi.verify(id);
          // Update the lead in leadsStore so all views reflect the verification
          await useLeadsStore.getState().verifyLead(id);
          set(
            { isLoading: false, activeId: null, modalKind: null },
            false,
            "verify/success",
          );
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to verify lead.";
          set({ isLoading: false, error: message }, false, "verify/error");
          throw err;
        }
      },

      // ── Selectors (derive from leadsStore) ─────────────────────────────

      getPendingVerifications: () => {
        return useLeadsStore
          .getState()
          .leads.filter((l) => l.status === LeadStatus.DEPOSIT_REPORTED);
      },

      getFiltered: () => {
        const { filter, search } = get();
        const leads = useLeadsStore.getState().leads;
        const base =
          filter === "PENDING"
            ? leads.filter((l) => l.status === LeadStatus.DEPOSIT_REPORTED)
            : leads.filter(
                (l) =>
                  l.status === LeadStatus.DEPOSIT_REPORTED ||
                  l.status === LeadStatus.DEPOSIT_CONFIRMED ||
                  l.status === LeadStatus.REJECTED,
              );
        if (!search) return base;
        const q = search.toLowerCase();
        return base.filter(
          (l) =>
            (l.displayName ?? "").toLowerCase().includes(q) ||
            (l.hfmBrokerId ?? "").toLowerCase().includes(q) ||
            l.telegramUserId.includes(q),
        );
      },

      getActiveRequest: () => {
        const { activeId } = get();
        if (!activeId) return undefined;
        return useLeadsStore.getState().leads.find((l) => l.id === activeId);
      },

      getVerifiedCount: () =>
        useLeadsStore
          .getState()
          .leads.filter((l) => l.status === LeadStatus.DEPOSIT_CONFIRMED)
          .length,

      getRejectedCount: () =>
        useLeadsStore
          .getState()
          .leads.filter((l) => l.status === LeadStatus.REJECTED).length,
    }),
    { name: "verification-store" },
  ),
);
