import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { superadminApi } from "@/lib/api/superadmin";
import { auditLogsApi } from "@/lib/api/auditLogs";
import { analyticsApi } from "@/lib/api/analytics";
import type {
  UserResponse,
  CreateUserInput,
  ChangeRoleInput,
} from "@/lib/schemas/user.schema";
import type {
  AuditLog,
  ListAuditLogsParams,
} from "@/lib/schemas/auditLog.schema";
import type { RagStats } from "@/lib/schemas/analytics.schema";
import type { ChangePasswordInput } from "@/lib/schemas/auth.schema";

interface SuperadminState {
  users: UserResponse[];
  auditLogs: AuditLog[];
  ragStats: RagStats | null;
  isLoadingUsers: boolean;
  isLoadingLogs: boolean;
  isLoadingRag: boolean;
  isMutating: boolean;
  error: string | null;
}

interface SuperadminActions {
  fetchUsers: () => Promise<void>;
  fetchAuditLogs: (params?: ListAuditLogsParams) => Promise<void>;
  fetchRagStats: () => Promise<void>;
  createUser: (data: CreateUserInput) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  reactivateUser: (id: string) => Promise<void>;
  changeUserRole: (id: string, data: ChangeRoleInput) => Promise<void>;
  forcePasswordChange: (id: string, data: ChangePasswordInput) => Promise<void>;
}

export const useSuperadminStore = create<SuperadminState & SuperadminActions>()(
  devtools(
    (set, get) => ({
      users: [],
      auditLogs: [],
      ragStats: null,
      isLoadingUsers: false,
      isLoadingLogs: false,
      isLoadingRag: false,
      isMutating: false,
      error: null,

      fetchUsers: async () => {
        set({ isLoadingUsers: true, error: null }, false, "fetchUsers/pending");
        try {
          const res = await superadminApi.findAllUsers();
          const userList = Array.isArray(res.data.data)
            ? res.data.data
            : (res.data.data as any)?.items ||
              (res.data.data as any)?.data ||
              [];
          set(
            { users: userList, isLoadingUsers: false },
            false,
            "fetchUsers/success",
          );
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load users.";
          set({ isLoadingUsers: false, error: msg }, false, "fetchUsers/error");
        }
      },

      fetchAuditLogs: async (params?: ListAuditLogsParams) => {
        set(
          { isLoadingLogs: true, error: null },
          false,
          "fetchAuditLogs/pending",
        );
        try {
          const res = await auditLogsApi.findMany(params);
          const logs = Array.isArray(res.data.data)
            ? res.data.data
            : (res.data.data as any)?.items ||
              (res.data.data as any)?.data ||
              [];
          set(
            { auditLogs: logs, isLoadingLogs: false },
            false,
            "fetchAuditLogs/success",
          );
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load audit logs.";
          set(
            { isLoadingLogs: false, error: msg },
            false,
            "fetchAuditLogs/error",
          );
        }
      },

      fetchRagStats: async () => {
        set({ isLoadingRag: true }, false, "fetchRagStats/pending");
        try {
          const res = await analyticsApi.getRagStats();
          set(
            { ragStats: res.data.data, isLoadingRag: false },
            false,
            "fetchRagStats/success",
          );
        } catch {
          set({ isLoadingRag: false }, false, "fetchRagStats/error");
        }
      },

      createUser: async (data: CreateUserInput) => {
        set({ isMutating: true, error: null }, false, "createUser/pending");
        try {
          await superadminApi.createUser(data);
          await get().fetchUsers();
          set({ isMutating: false }, false, "createUser/success");
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to create user.";
          set({ isMutating: false, error: msg }, false, "createUser/error");
          throw err;
        }
      },

      deactivateUser: async (id: string) => {
        set({ isMutating: true }, false, "deactivateUser/pending");
        try {
          await superadminApi.deactivateUser(id);
          set(
            (s) => ({
              users: s.users.map((u) =>
                u.id === id ? { ...u, isActive: false } : u,
              ),
              isMutating: false,
            }),
            false,
            "deactivateUser/success",
          );
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to deactivate user.";
          set({ isMutating: false, error: msg }, false, "deactivateUser/error");
          throw err;
        }
      },

      reactivateUser: async (id: string) => {
        set({ isMutating: true }, false, "reactivateUser/pending");
        try {
          await superadminApi.reactivateUser(id);
          set(
            (s) => ({
              users: s.users.map((u) =>
                u.id === id ? { ...u, isActive: true } : u,
              ),
              isMutating: false,
            }),
            false,
            "reactivateUser/success",
          );
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to reactivate user.";
          set({ isMutating: false, error: msg }, false, "reactivateUser/error");
          throw err;
        }
      },

      changeUserRole: async (id: string, data: ChangeRoleInput) => {
        set({ isMutating: true }, false, "changeUserRole/pending");
        try {
          const res = await superadminApi.changeUserRole(id, data);
          set(
            (s) => ({
              users: s.users.map((u) => (u.id === id ? res.data.data : u)),
              isMutating: false,
            }),
            false,
            "changeUserRole/success",
          );
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to change role.";
          set({ isMutating: false, error: msg }, false, "changeUserRole/error");
          throw err;
        }
      },

      forcePasswordChange: async (id: string, data: ChangePasswordInput) => {
        set({ isMutating: true }, false, "forcePasswordChange/pending");
        try {
          await superadminApi.forcePasswordChange(id, data);
          set({ isMutating: false }, false, "forcePasswordChange/success");
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to reset password.";
          set(
            { isMutating: false, error: msg },
            false,
            "forcePasswordChange/error",
          );
          throw err;
        }
      },
    }),
    { name: "superadmin-store" },
  ),
);
