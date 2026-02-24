import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { usersApi } from "@/lib/api/users";
import type { UserResponse, InvitationResponse, InviteUserInput, ChangeRoleInput } from "@/lib/schemas/user.schema";
import type { ChangePasswordInput } from "@/lib/schemas/auth.schema";

// ── State & Actions ────────────────────────────────────────────────────────

interface UsersState {
  users: UserResponse[];
  invitations: InvitationResponse[];
  isLoading: boolean;
  error: string | null;
}

interface UsersActions {
  fetchUsers: () => Promise<void>;
  fetchInvitations: () => Promise<void>;
  inviteUser: (data: InviteUserInput) => Promise<InvitationResponse>;
  deactivateUser: (id: string) => Promise<void>;
  reactivateUser: (id: string) => Promise<void>;
  changeRole: (id: string, data: ChangeRoleInput) => Promise<void>;
  changePassword: (id: string, data: ChangePasswordInput) => Promise<void>;
  deleteInvitation: (id: string) => Promise<void>;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useUsersStore = create<UsersState & UsersActions>()(
  devtools(
    (set) => ({
      users: [],
      invitations: [],
      isLoading: false,
      error: null,

      fetchUsers: async () => {
        set({ isLoading: true, error: null }, false, "fetchUsers/pending");
        try {
          const res = await usersApi.findAll();
          set({ users: res.data.data, isLoading: false }, false, "fetchUsers/success");
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load users.";
          set({ isLoading: false, error: message }, false, "fetchUsers/error");
        }
      },

      fetchInvitations: async () => {
        set({ isLoading: true, error: null }, false, "fetchInvitations/pending");
        try {
          const res = await usersApi.listInvitations();
          set({ invitations: res.data.data, isLoading: false }, false, "fetchInvitations/success");
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load invitations.";
          set({ isLoading: false, error: message }, false, "fetchInvitations/error");
        }
      },

      inviteUser: async (data: InviteUserInput) => {
        const res = await usersApi.invite(data);
        const invitation = res.data.data;
        set(
          (s) => ({ invitations: [...s.invitations, invitation] }),
          false,
          "inviteUser/success",
        );
        return invitation;
      },

      deactivateUser: async (id: string) => {
        await usersApi.deactivate(id);
        set(
          (s) => ({
            users: s.users.map((u) => (u.id === id ? { ...u, isActive: false } : u)),
          }),
          false,
          "deactivateUser/success",
        );
      },

      reactivateUser: async (id: string) => {
        const res = await usersApi.reactivate(id);
        const updated = res.data.data;
        set(
          (s) => ({ users: s.users.map((u) => (u.id === id ? updated : u)) }),
          false,
          "reactivateUser/success",
        );
      },

      changeRole: async (id: string, data: ChangeRoleInput) => {
        const res = await usersApi.changeRole(id, data);
        const updated = res.data.data;
        set(
          (s) => ({ users: s.users.map((u) => (u.id === id ? updated : u)) }),
          false,
          "changeRole/success",
        );
      },

      changePassword: async (id: string, data: ChangePasswordInput) => {
        await usersApi.changePassword(id, data);
      },

      deleteInvitation: async (id: string) => {
        await usersApi.deleteInvitation(id);
        set(
          (s) => ({ invitations: s.invitations.filter((inv) => inv.id !== id) }),
          false,
          "deleteInvitation/success",
        );
      },
    }),
    { name: "users-store" },
  ),
);
