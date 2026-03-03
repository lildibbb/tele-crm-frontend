import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { usersApi } from "@/lib/api/users";
import type { InviteUserInput, ChangeRoleInput } from "@/lib/schemas/user.schema";
import type { ChangePasswordInput } from "@/lib/schemas/auth.schema";

export function useUsersList() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: async () => {
      const res = await usersApi.findAll();
      return res.data.data;
    },
  });
}

export function useInvitationsList() {
  return useQuery({
    queryKey: queryKeys.users.invitations(),
    queryFn: async () => {
      const res = await usersApi.listInvitations();
      return res.data.data;
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteUserInput) => usersApi.invite(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.invitations() });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.reactivate(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
    },
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeRoleInput }) =>
      usersApi.changeRole(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
    },
  });
}

export function useChangeUserPassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePasswordInput }) =>
      usersApi.changePassword(id, data),
  });
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.deleteInvitation(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.invitations() });
    },
  });
}
