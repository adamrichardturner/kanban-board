import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiResponse } from '@/types';
import {
  TaskResponse,
  TaskWithSubtasks,
  SubtaskResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
  CreateSubtaskRequest,
  UpdateSubtaskRequest,
  ReorderRequest,
} from '@/types/kanban';

export function useTasks() {
  const queryClient = useQueryClient();
  const getColumnTasks = async (columnId: string): Promise<TaskResponse[]> => {
    const res = await fetch(`/api/tasks?columnId=${columnId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch tasks');
    }
    const data: ApiResponse<TaskResponse[]> = await res.json();
    return data.data!;
  };

  const getTask = async (taskId: string): Promise<TaskWithSubtasks> => {
    const res = await fetch(`/api/tasks/${taskId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch task');
    }
    const data: ApiResponse<TaskWithSubtasks> = await res.json();
    return data.data!;
  };

  const getTaskSubtasks = async (
    taskId: string,
  ): Promise<SubtaskResponse[]> => {
    const res = await fetch(`/api/subtasks?taskId=${taskId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch subtasks');
    }
    const data: ApiResponse<SubtaskResponse[]> = await res.json();
    return data.data!;
  };

  const useColumnTasksQuery = (columnId: string) => {
    return useQuery<TaskResponse[], Error>({
      queryKey: ['tasks', 'column', columnId],
      queryFn: () => getColumnTasks(columnId),
      enabled: !!columnId,
      staleTime: 1000 * 60 * 1,
    });
  };

  const useTaskQuery = (taskId: string) => {
    return useQuery<TaskWithSubtasks, Error>({
      queryKey: ['tasks', taskId],
      queryFn: () => getTask(taskId),
      enabled: !!taskId,
      staleTime: 1000 * 60 * 1,
    });
  };

  const useTaskSubtasksQuery = (taskId: string) => {
    return useQuery<SubtaskResponse[], Error>({
      queryKey: ['subtasks', 'task', taskId],
      queryFn: () => getTaskSubtasks(taskId),
      enabled: !!taskId,
      staleTime: 1000 * 60 * 1,
    });
  };

  const createTaskMutation = useMutation<
    TaskResponse,
    Error,
    { boardId: string; data: CreateTaskRequest }
  >({
    mutationFn: async ({ boardId, data }) => {
      const res = await fetch(`/api/tasks?boardId=${boardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to create task');
      }

      const response: ApiResponse<TaskResponse> = await res.json();
      return response.data!;
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData<TaskResponse[]>(
        ['tasks', 'column', newTask.columnId],
        (old) => (old ? [...old, newTask] : [newTask]),
      );

      queryClient.invalidateQueries({ queryKey: ['boards', newTask.boardId] });
    },
    onError: (error) => {
      console.error('Create task failed:', error);
    },
  });

  const updateTaskMutation = useMutation<
    TaskResponse,
    Error,
    { taskId: string; data: UpdateTaskRequest }
  >({
    mutationFn: async ({ taskId, data }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to update task');
      }

      const response: ApiResponse<TaskResponse> = await res.json();
      return response.data!;
    },
    onSuccess: (updatedTask, { data }) => {
      queryClient.setQueryData(
        ['tasks', updatedTask.id],
        (old: TaskWithSubtasks | undefined) => {
          return old ? { ...old, ...updatedTask } : undefined;
        },
      );

      if (data.columnId && data.columnId !== updatedTask.columnId) {
        queryClient.setQueryData<TaskResponse[]>(
          ['tasks', 'column', updatedTask.columnId],
          (old) =>
            old ? old.filter((task) => task.id !== updatedTask.id) : [],
        );

        queryClient.setQueryData<TaskResponse[]>(
          ['tasks', 'column', data.columnId],
          (old) => (old ? [...old, updatedTask] : [updatedTask]),
        );
      } else {
        queryClient.setQueryData<TaskResponse[]>(
          ['tasks', 'column', updatedTask.columnId],
          (old) =>
            old
              ? old.map((task) =>
                  task.id === updatedTask.id ? updatedTask : task,
                )
              : [updatedTask],
        );
      }

      queryClient.invalidateQueries({
        queryKey: ['boards', updatedTask.boardId],
      });
    },
    onError: (error) => {
      console.error('Update task failed:', error);
    },
  });

  const deleteTaskMutation = useMutation<
    void,
    Error,
    string,
    { task: TaskWithSubtasks | undefined }
  >({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete task');
      }
    },
    onMutate: async (taskId) => {
      const task = queryClient.getQueryData<TaskWithSubtasks>([
        'tasks',
        taskId,
      ]);
      return { task };
    },
    onSuccess: (_, taskId, context) => {
      if (context?.task) {
        queryClient.setQueryData<TaskResponse[]>(
          ['tasks', 'column', context.task.columnId],
          (old) => (old ? old.filter((task) => task.id !== taskId) : []),
        );

        queryClient.invalidateQueries({
          queryKey: ['boards', context.task.boardId],
        });
      }

      queryClient.removeQueries({ queryKey: ['tasks', taskId] });
      queryClient.removeQueries({ queryKey: ['subtasks', 'task', taskId] });
    },
    onError: (error) => {
      console.error('Delete task failed:', error);
    },
  });

  const moveTaskMutation = useMutation<
    TaskResponse,
    Error,
    { taskId: string; data: MoveTaskRequest },
    { previousTask: TaskWithSubtasks | undefined }
  >({
    mutationFn: async ({ taskId, data }) => {
      const res = await fetch(`/api/tasks/${taskId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to move task');
      }

      const response: ApiResponse<TaskResponse> = await res.json();
      return response.data!;
    },
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousTask = queryClient.getQueryData<TaskWithSubtasks>([
        'tasks',
        taskId,
      ]);

      if (previousTask) {
        const updatedTask = {
          ...previousTask,
          columnId: data.columnId,
          position: data.position,
        };
        queryClient.setQueryData(['tasks', taskId], updatedTask);

        if (previousTask.columnId !== data.columnId) {
          queryClient.setQueryData<TaskResponse[]>(
            ['tasks', 'column', previousTask.columnId],
            (old) => (old ? old.filter((task) => task.id !== taskId) : []),
          );

          queryClient.setQueryData<TaskResponse[]>(
            ['tasks', 'column', data.columnId],
            (old) => (old ? [...old, updatedTask] : [updatedTask]),
          );
        }
      }

      return { previousTask };
    },
    onError: (error, _, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(
          ['tasks', context.previousTask.id],
          context.previousTask,
        );
      }
      console.error('Move task failed:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

  const reorderTasksMutation = useMutation<
    void,
    Error,
    { columnId: string; data: ReorderRequest },
    { previousTasks: TaskResponse[] | undefined }
  >({
    mutationFn: async ({ columnId, data }) => {
      const res = await fetch(`/api/tasks/reorder?columnId=${columnId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to reorder tasks');
      }
    },
    onMutate: async ({ columnId, data }) => {
      await queryClient.cancelQueries({
        queryKey: ['tasks', 'column', columnId],
      });

      const previousTasks = queryClient.getQueryData<TaskResponse[]>([
        'tasks',
        'column',
        columnId,
      ]);

      if (previousTasks) {
        const reorderedTasks = [...previousTasks].sort((a, b) => {
          const aPos =
            data.items.find((item) => item.id === a.id)?.position ?? a.position;
          const bPos =
            data.items.find((item) => item.id === b.id)?.position ?? b.position;
          return aPos - bPos;
        });

        queryClient.setQueryData(['tasks', 'column', columnId], reorderedTasks);
      }

      return { previousTasks };
    },
    onError: (error, { columnId }, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ['tasks', 'column', columnId],
          context.previousTasks,
        );
      }
      console.error('Reorder tasks failed:', error);
    },
    onSettled: (data, error, { columnId }) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'column', columnId],
      });
    },
  });

  const createSubtaskMutation = useMutation<
    SubtaskResponse,
    Error,
    { taskId: string; data: CreateSubtaskRequest }
  >({
    mutationFn: async ({ taskId, data }) => {
      const res = await fetch(`/api/subtasks?taskId=${taskId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to create subtask');
      }

      const response: ApiResponse<SubtaskResponse> = await res.json();
      return response.data!;
    },
    onSuccess: (newSubtask) => {
      queryClient.setQueryData<SubtaskResponse[]>(
        ['subtasks', 'task', newSubtask.taskId],
        (old) => (old ? [...old, newSubtask] : [newSubtask]),
      );

      queryClient.setQueryData(
        ['tasks', newSubtask.taskId],
        (old: TaskWithSubtasks | undefined) => {
          return old
            ? { ...old, subtasks: [...(old.subtasks || []), newSubtask] }
            : undefined;
        },
      );
    },
    onError: (error) => {
      console.error('Create subtask failed:', error);
    },
  });

  const updateSubtaskMutation = useMutation<
    SubtaskResponse,
    Error,
    { subtaskId: string; data: UpdateSubtaskRequest }
  >({
    mutationFn: async ({ subtaskId, data }) => {
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to update subtask');
      }

      const response: ApiResponse<SubtaskResponse> = await res.json();
      return response.data!;
    },
    onSuccess: (updatedSubtask) => {
      queryClient.setQueryData<SubtaskResponse[]>(
        ['subtasks', 'task', updatedSubtask.taskId],
        (old) =>
          old
            ? old.map((subtask) =>
                subtask.id === updatedSubtask.id ? updatedSubtask : subtask,
              )
            : [updatedSubtask],
      );

      queryClient.setQueryData(
        ['tasks', updatedSubtask.taskId],
        (old: TaskWithSubtasks | undefined) => {
          return old
            ? {
                ...old,
                subtasks: old.subtasks?.map((subtask) =>
                  subtask.id === updatedSubtask.id ? updatedSubtask : subtask,
                ) || [updatedSubtask],
              }
            : undefined;
        },
      );
    },
    onError: (error) => {
      console.error('Update subtask failed:', error);
    },
  });

  const deleteSubtaskMutation = useMutation<
    void,
    Error,
    string,
    { taskId: string | null }
  >({
    mutationFn: async (subtaskId: string) => {
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete subtask');
      }
    },
    onMutate: async (subtaskId) => {
      const queryCache = queryClient.getQueryCache();
      let taskId: string | null = null;

      queryCache.getAll().forEach((query) => {
        if (query.queryKey[0] === 'subtasks' && query.queryKey[1] === 'task') {
          const subtasks = query.state.data as SubtaskResponse[] | undefined;
          if (subtasks?.some((subtask) => subtask.id === subtaskId)) {
            taskId = query.queryKey[2] as string;
          }
        }
      });

      return { taskId };
    },
    onSuccess: (_, subtaskId, context) => {
      if (context?.taskId) {
        queryClient.setQueryData<SubtaskResponse[]>(
          ['subtasks', 'task', context.taskId],
          (old) =>
            old ? old.filter((subtask) => subtask.id !== subtaskId) : [],
        );

        queryClient.setQueryData(
          ['tasks', context.taskId],
          (old: TaskWithSubtasks | undefined) => {
            return old
              ? {
                  ...old,
                  subtasks:
                    old.subtasks?.filter(
                      (subtask) => subtask.id !== subtaskId,
                    ) || [],
                }
              : undefined;
          },
        );
      }
    },
    onError: (error) => {
      console.error('Delete subtask failed:', error);
    },
  });

  const reorderSubtasksMutation = useMutation<
    void,
    Error,
    { taskId: string; data: ReorderRequest },
    { previousSubtasks: SubtaskResponse[] | undefined }
  >({
    mutationFn: async ({ taskId, data }) => {
      const res = await fetch(`/api/subtasks/reorder?taskId=${taskId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to reorder subtasks');
      }
    },
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({
        queryKey: ['subtasks', 'task', taskId],
      });

      const previousSubtasks = queryClient.getQueryData<SubtaskResponse[]>([
        'subtasks',
        'task',
        taskId,
      ]);

      if (previousSubtasks) {
        const reorderedSubtasks = [...previousSubtasks].sort((a, b) => {
          const aPos =
            data.items.find((item) => item.id === a.id)?.position ?? a.position;
          const bPos =
            data.items.find((item) => item.id === b.id)?.position ?? b.position;
          return aPos - bPos;
        });

        queryClient.setQueryData(
          ['subtasks', 'task', taskId],
          reorderedSubtasks,
        );
      }

      return { previousSubtasks };
    },
    onError: (error, { taskId }, context) => {
      if (context?.previousSubtasks) {
        queryClient.setQueryData(
          ['subtasks', 'task', taskId],
          context.previousSubtasks,
        );
      }
      console.error('Reorder subtasks failed:', error);
    },
    onSettled: (data, error, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', 'task', taskId] });
    },
  });

  return {
    // Query hooks
    useColumnTasksQuery,
    useTaskQuery,
    useTaskSubtasksQuery,

    // Task actions
    createTask: (boardId: string, data: CreateTaskRequest) =>
      createTaskMutation.mutate({ boardId, data }),
    updateTask: (taskId: string, data: UpdateTaskRequest) =>
      updateTaskMutation.mutate({ taskId, data }),
    deleteTask: (taskId: string) => deleteTaskMutation.mutate(taskId),
    moveTask: (taskId: string, data: MoveTaskRequest) =>
      moveTaskMutation.mutate({ taskId, data }),
    reorderTasks: (columnId: string, data: ReorderRequest) =>
      reorderTasksMutation.mutate({ columnId, data }),

    // Subtask actions
    createSubtask: (taskId: string, data: CreateSubtaskRequest) =>
      createSubtaskMutation.mutate({ taskId, data }),
    updateSubtask: (subtaskId: string, data: UpdateSubtaskRequest) =>
      updateSubtaskMutation.mutate({ subtaskId, data }),
    deleteSubtask: (subtaskId: string) =>
      deleteSubtaskMutation.mutate(subtaskId),
    reorderSubtasks: (taskId: string, data: ReorderRequest) =>
      reorderSubtasksMutation.mutate({ taskId, data }),

    // Mutation states
    isCreatingTask: createTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
    isMovingTask: moveTaskMutation.isPending,
    isReorderingTasks: reorderTasksMutation.isPending,

    isCreatingSubtask: createSubtaskMutation.isPending,
    isUpdatingSubtask: updateSubtaskMutation.isPending,
    isDeletingSubtask: deleteSubtaskMutation.isPending,
    isReorderingSubtasks: reorderSubtasksMutation.isPending,

    // Error states
    taskError:
      createTaskMutation.error?.message ||
      updateTaskMutation.error?.message ||
      deleteTaskMutation.error?.message ||
      moveTaskMutation.error?.message ||
      reorderTasksMutation.error?.message ||
      null,

    subtaskError:
      createSubtaskMutation.error?.message ||
      updateSubtaskMutation.error?.message ||
      deleteSubtaskMutation.error?.message ||
      reorderSubtasksMutation.error?.message ||
      null,

    // Utility
    refetchTasks: (columnId?: string) => {
      if (columnId) {
        queryClient.invalidateQueries({
          queryKey: ['tasks', 'column', columnId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    },
    refetchSubtasks: (taskId?: string) => {
      if (taskId) {
        queryClient.invalidateQueries({
          queryKey: ['subtasks', 'task', taskId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['subtasks'] });
      }
    },
  };
}
