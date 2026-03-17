import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { pendingTasksApi } from "@/lib/api/pendingTasks";
import { parseApiData, parsePaginatedData } from "@/lib/api/parseResponse";
import type {
  ListPendingTaskGroupsParams,
  ListPendingTasksParams,
  PendingTaskGroupedByLeadResponse,
  PendingTask,
  UpdatePendingTaskInput,
} from "@/lib/schemas/pendingTask.schema";

export function usePendingTasksList(params: ListPendingTasksParams = {}) {
  return useQuery({
    queryKey: queryKeys.pendingTasks.list(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await pendingTasksApi.list({
        leadId: params.leadId,
        status: params.status,
        skip: params.skip ?? 0,
        take: params.take ?? 20,
      });
      const { data, total } = parsePaginatedData<PendingTask>(res.data);
      const take = params.take ?? 20;
      const resolvedTotal = total ?? data.length;
      return {
        data,
        total: resolvedTotal,
        pageCount: Math.max(1, Math.ceil(resolvedTotal / take)),
      };
    },
    placeholderData: (prev) => prev,
  });
}

export function usePendingTasksGroupedByLead(
  params: ListPendingTaskGroupsParams = {},
) {
  return useQuery({
    queryKey: queryKeys.pendingTasks.grouped(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await pendingTasksApi.groupedByLead({
        status: params.status,
      });
      return parseApiData<PendingTaskGroupedByLeadResponse>(res.data);
    },
    placeholderData: (prev) => prev,
  });
}

export function useUpdatePendingTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePendingTaskInput;
    }) => pendingTasksApi.updateStatus(id, data),
    onSuccess: (response, variables) => {
      const updatedTask = parseApiData<PendingTask>(response.data);

      queryClient.setQueriesData(
        { queryKey: queryKeys.pendingTasks.lists() },
        (
          old:
            | {
                data: PendingTask[];
                total: number;
                pageCount: number;
              }
            | undefined,
        ) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((task) =>
              task.id === variables.id ? updatedTask : task,
            ),
          };
        },
      );

      queryClient.setQueriesData(
        { queryKey: queryKeys.pendingTasks.groupedAll() },
        (old: PendingTaskGroupedByLeadResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            groups: old.groups.map((group) => ({
              ...group,
              tasks: group.tasks.map((task) =>
                task.id === variables.id ? updatedTask : task,
              ),
            })),
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: queryKeys.pendingTasks.all });
    },
  });
}
