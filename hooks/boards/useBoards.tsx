import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { BoardResponse, BoardWithColumns, ApiResponse } from '@/types';
import {
  CreateBoardRequest,
  ReorderRequest,
  UpdateBoardRequest,
} from '@/types/kanban';
import { useSelectedBoard } from './useSelectedBoard';

export function useBoards() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setSelectedBoard } = useSelectedBoard();

  const getUserBoards = async (): Promise<BoardResponse[]> => {
    const res = await fetch('/api/boards');
    if (!res.ok) {
      throw new Error('Failed to fetch boards');
    }
    const data: ApiResponse<BoardResponse[]> = await res.json();
    return data.data!;
  };

  const getBoard = async (boardId: string): Promise<BoardWithColumns> => {
    const res = await fetch(`/api/boards/${boardId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch board');
    }
    const data: ApiResponse<BoardWithColumns> = await res.json();
    return data.data!;
  };

  const boardsQuery = useQuery<BoardResponse[], Error>({
    queryKey: ['boards'],
    queryFn: getUserBoards,
    staleTime: 1000 * 60 * 2,
  });

  const useBoardQuery = (boardId: string) => {
    return useQuery<BoardWithColumns, Error>({
      queryKey: ['boards', boardId],
      queryFn: () => getBoard(boardId),
      enabled: Boolean(boardId),
      staleTime: 1000 * 60 * 1,
    });
  };

  const createBoardMutation = useMutation<
    BoardResponse,
    Error,
    CreateBoardRequest
  >({
    mutationFn: async (data: CreateBoardRequest) => {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to create board');
      }

      const response: ApiResponse<BoardResponse> = await res.json();
      return response.data!;
    },
    onSuccess: (newBoard) => {
      queryClient.setQueryData<BoardResponse[]>(['boards'], (old) => {
        return old ? [...old, newBoard] : [newBoard];
      });

      // Set as selected board and navigate
      setSelectedBoard(newBoard.id);
      router.push(`/boards/${newBoard.id}`);
    },
    onError: (error) => {
      console.error('Create board failed:', error);
    },
  });

  const updateBoardMutation = useMutation<
    BoardResponse,
    Error,
    { boardId: string; data: UpdateBoardRequest }
  >({
    mutationFn: async ({ boardId, data }) => {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to update board');
      }

      const response: ApiResponse<BoardResponse> = await res.json();
      return response.data!;
    },
    onSuccess: (updatedBoard) => {
      queryClient.setQueryData<BoardResponse[]>(['boards'], (old) => {
        return old
          ? old.map((board) =>
              board.id === updatedBoard.id ? updatedBoard : board,
            )
          : [updatedBoard];
      });

      queryClient.setQueryData(
        ['boards', updatedBoard.id],
        (old: BoardWithColumns | undefined) => {
          return old ? { ...old, ...updatedBoard } : undefined;
        },
      );
    },
    onError: (error) => {
      console.error('Update board failed:', error);
    },
  });

  const deleteBoardMutation = useMutation<void, Error, string>({
    mutationFn: async (boardId: string) => {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete board');
      }
    },
    onSuccess: (_, boardId) => {
      queryClient.setQueryData<BoardResponse[]>(['boards'], (old) => {
        return old ? old.filter((board) => board.id !== boardId) : [];
      });

      queryClient.removeQueries({ queryKey: ['boards', boardId] });

      // Clear selection if deleted board was selected
      const currentSelection = queryClient.getQueryData<string>([
        'selectedBoard',
      ]);
      if (currentSelection === boardId) {
        // Select the first available board or clear selection
        const boards = queryClient.getQueryData<BoardResponse[]>(['boards']);
        const remainingBoards = boards?.filter((board) => board.id !== boardId);

        if (remainingBoards && remainingBoards.length > 0) {
          const firstBoard = remainingBoards.sort(
            (a, b) => a.position - b.position,
          )[0];
          setSelectedBoard(firstBoard.id);
          router.push(`/boards/${firstBoard.id}`);
        } else {
          setSelectedBoard(null);
          router.push('/boards');
        }
      }
    },
    onError: (error) => {
      console.error('Delete board failed:', error);
    },
  });

  const reorderBoardsMutation = useMutation<
    void,
    Error,
    ReorderRequest,
    { previousBoards: BoardResponse[] | undefined }
  >({
    mutationFn: async (data: ReorderRequest) => {
      const res = await fetch('/api/boards/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to reorder boards');
      }
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ['boards'] });

      const previousBoards = queryClient.getQueryData<BoardResponse[]>([
        'boards',
      ]);

      if (previousBoards) {
        const reorderedBoards = [...previousBoards].sort((a, b) => {
          const aPos =
            newOrder.items.find((item) => item.id === a.id)?.position ??
            a.position;
          const bPos =
            newOrder.items.find((item) => item.id === b.id)?.position ??
            b.position;
          return aPos - bPos;
        });

        queryClient.setQueryData(['boards'], reorderedBoards);
      }

      return { previousBoards };
    },
    onError: (error, _, context) => {
      if (context?.previousBoards) {
        queryClient.setQueryData(['boards'], context.previousBoards);
      }
      console.error('Reorder boards failed:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

  const setDefaultBoardMutation = useMutation<void, Error, string>({
    mutationFn: async (boardId: string) => {
      const res = await fetch(`/api/boards/${boardId}/default`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to set default board');
      }
    },
    onSuccess: (_, boardId) => {
      queryClient.setQueryData<BoardResponse[]>(['boards'], (old) => {
        return old
          ? old.map((board) => ({
              ...board,
              isDefault: board.id === boardId,
            }))
          : [];
      });
    },
    onError: (error) => {
      console.error('Set default board failed:', error);
    },
  });

  return {
    boards: boardsQuery.data || [],
    isLoading: boardsQuery.isLoading,
    error: boardsQuery.error?.message || null,

    useBoardQuery,

    createBoard: (data: CreateBoardRequest) => createBoardMutation.mutate(data),
    updateBoard: (boardId: string, data: UpdateBoardRequest) =>
      updateBoardMutation.mutate({ boardId, data }),
    deleteBoard: (boardId: string) => deleteBoardMutation.mutate(boardId),
    reorderBoards: (data: ReorderRequest) => reorderBoardsMutation.mutate(data),
    setDefaultBoard: (boardId: string) =>
      setDefaultBoardMutation.mutate(boardId),

    isCreating: createBoardMutation.isPending,
    isUpdating: updateBoardMutation.isPending,
    isDeleting: deleteBoardMutation.isPending,
    isReordering: reorderBoardsMutation.isPending,
    isSettingDefault: setDefaultBoardMutation.isPending,

    refetch: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  };
}

export function useBoard(boardId: string) {
  const getBoard = async (boardId: string): Promise<BoardWithColumns> => {
    const res = await fetch(`/api/boards/${boardId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch board');
    }
    const data: ApiResponse<BoardWithColumns> = await res.json();
    return data.data!;
  };

  return useQuery<BoardWithColumns, Error>({
    queryKey: ['boards', boardId],
    queryFn: () => getBoard(boardId),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 1,
  });
}
