import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { superadminApi } from "@/lib/api/superadmin";
import type { SecretMeta } from "@/lib/api/superadmin";
import { parseApiData } from "@/lib/api/parseResponse";

interface SecretsState {
  secrets: SecretMeta[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

interface SecretsActions {
  fetchSecrets: () => Promise<void>;
  setSecret: (key: string, value: string, description?: string) => Promise<void>;
  deleteSecret: (key: string) => Promise<void>;
}

export const useSecretsStore = create<SecretsState & SecretsActions>()(
  devtools(
    (set, get) => ({
      secrets: [],
      isLoading: false,
      isMutating: false,
      error: null,

      fetchSecrets: async () => {
        set({ isLoading: true, error: null }, false, "secrets/fetch/pending");
        try {
          const res = await superadminApi.listSecrets();
          const data = parseApiData<SecretMeta[]>(res.data) ?? [];
          set({ isLoading: false, secrets: data }, false, "secrets/fetch/success");
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to load secrets";
          set({ isLoading: false, error: msg }, false, "secrets/fetch/error");
        }
      },

      setSecret: async (key, value, description) => {
        set({ isMutating: true, error: null }, false, "secrets/set/pending");
        try {
          await superadminApi.setSecret({ key, value, description });
          await get().fetchSecrets();
          set({ isMutating: false }, false, "secrets/set/success");
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to save secret";
          set({ isMutating: false, error: msg }, false, "secrets/set/error");
          throw err;
        }
      },

      deleteSecret: async (key) => {
        set({ isMutating: true, error: null }, false, "secrets/delete/pending");
        try {
          await superadminApi.deleteSecret(key);
          set(
            (s) => ({ isMutating: false, secrets: s.secrets.filter((sec) => sec.key !== key) }),
            false,
            "secrets/delete/success",
          );
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to delete secret";
          set({ isMutating: false, error: msg }, false, "secrets/delete/error");
          throw err;
        }
      },
    }),
    { name: "secrets-store" },
  ),
);
