import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  BoardResponse,
  BoardWithColumns,
  ColumnResponse,
  ApiResponse,
} from '@/types';
import {
  CreateBoardRequest,
  CreateColumnRequest,
  ReorderRequest,
  UpdateBoardRequest,
} from '@/types/kanban';
import { useSelectedBoard } from './useSelectedBoard';
import { toast } from 'sonner';

export interface CreateBoardWithColumnsRequest {
  name: string;
  isDefault?: boolean;
  columns?: string[];
}

export function useBoards() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    setSelectedBoard,
    selectedBoardId,
    invalidateSelectedBoard,
    refetchSelectedBoard,
  } = useSelectedBoard();

  const createColumnsForBoard = async (
    boardId: string,
    columnNames: string[],
  ) => {
    console.log(
      'Creating columns sequentially for board:',
      boardId,
      'columns:',
      columnNames,
    );

    // Create columns sequentially to avoid race condition with position calculation
    for (let i = 0; i < columnNames.length; i++) {
      const name = columnNames[i];
      console.log(`Creating column ${i + 1}/${columnNames.length}: "${name}"`);

      const columnData: CreateColumnRequest = {
        name,
      };

      const response = await fetch(`/api/columns?boardId=${boardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(columnData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Column creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          columnName: name,
          boardId,
          columnIndex: i,
        });
        throw new Error(
          `Failed to create column "${name}": ${response.status} ${errorText}`,
        );
      }

      const result = await response.json();
      console.log(`Successfully created column "${name}":`, result);
    }

    console.log('All columns created successfully for board:', boardId);
  };

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
    // Keep results fresh enough but avoid multiple refetches on mount/focus
    staleTime: 1000 * 60 * 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const useBoardQuery = (boardId: string) => {
    return useQuery<BoardWithColumns, Error>({
      queryKey: ['boards', boardId],
      queryFn: () => getBoard(boardId),
      enabled: Boolean(boardId),
      staleTime: 1000 * 60 * 1,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    });
  };

  const createBoardMutation = useMutation<
    BoardResponse,
    Error,
    CreateBoardWithColumnsRequest
  >({
    mutationFn: async (data: CreateBoardWithColumnsRequest) => {
      // Create the board first (without columns in the API request)
      const { columns, ...boardData } = data;
      const boardPayload: CreateBoardRequest = {
        name: boardData.name,
        isDefault: boardData.isDefault,
      };

      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boardPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage =
          errorData.error || errorData.message || 'Failed to create board';
        throw new Error(errorMessage);
      }

      const response: ApiResponse<BoardResponse> = await res.json();
      const newBoard = response.data!;

      // Create columns if provided
      if (columns && columns.length > 0) {
        const filteredColumns = columns.filter((column) => column.trim());
        if (filteredColumns.length > 0) {
          await createColumnsForBoard(newBoard.id, filteredColumns);
        }
      }

      return newBoard;
    },
    onSuccess: (newBoard) => {
      queryClient.setQueryData<BoardResponse[]>(['boards'], (old) => {
        return old ? [...old, newBoard] : [newBoard];
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['boards', newBoard.id] });

      // Set as selected board and navigate
      setSelectedBoard(newBoard.id);
      router.push(`/boards/${newBoard.id}`);

      toast.success('Board created successfully!');
    },
    onError: (error) => {
      console.error('Create board failed:', error);

      // Check if it's a duplicate name error
      if (
        error.message.includes('duplicate key') ||
        error.message.includes('already exists')
      ) {
        toast.error(
          'A board with this name already exists. Please choose a different name.',
        );
      } else {
        toast.error('Failed to create board. Please try again.');
      }
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

      // Invalidate the detailed board cache to force refetch with updated columns
      queryClient.invalidateQueries({ queryKey: ['boards', updatedBoard.id] });

      // Force immediate refetch of selected board data to ensure fresh columns
      invalidateSelectedBoard();
      refetchSelectedBoard();

      console.log(
        'Board update successful, invalidated and refetched caches for board:',
        updatedBoard.id,
      );

      toast.success('Board updated successfully!');
    },
    onError: (error) => {
      console.error('Update board failed:', error);
      toast.error('Failed to update board. Please try again.');
    },
  });

  const deleteBoardMutation = useMutation<
    void,
    Error,
    string,
    { previousBoards: BoardResponse[] | undefined }
  >({
    mutationFn: async (boardId: string) => {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        // Treat 404 as success since the board is already gone
        if (res.status === 404) {
          console.log('Board already deleted (404), treating as success');
          return;
        }

        const errorText = await res.text();
        throw new Error(`Failed to delete board: ${res.status} ${errorText}`);
      }
    },
    onMutate: async (deletedBoardId) => {
      // Cancel any outgoing refetches to prevent optimistic updates from being overwritten
      await queryClient.cancelQueries({ queryKey: ['boards'] });

      // Snapshot the previous value
      const previousBoards = queryClient.getQueryData<BoardResponse[]>([
        'boards',
      ]);

      // Optimistically update to remove the board
      if (previousBoards) {
        const filteredBoards = previousBoards.filter(
          (board) => board.id !== deletedBoardId,
        );
        queryClient.setQueryData<BoardResponse[]>(['boards'], filteredBoards);
      }

      // Remove the specific board query immediately
      queryClient.removeQueries({ queryKey: ['boards', deletedBoardId] });

      return { previousBoards };
    },
    onSuccess: (_, deletedBoardId) => {
      try {
        // Handle navigation if the deleted board was currently selected
        const currentSelectedBoardId = selectedBoardId;

        if (currentSelectedBoardId === deletedBoardId) {
          // Get the updated boards list (should already be filtered from optimistic update)
          const remainingBoards =
            queryClient.getQueryData<BoardResponse[]>(['boards']) || [];

          if (remainingBoards.length > 0) {
            // Sort remaining boards by position and select the first one
            const sortedBoards = [...remainingBoards].sort(
              (a, b) => a.position - b.position,
            );
            const firstBoard = sortedBoards[0];

            console.log('Navigating to first available board:', firstBoard.id);
            setSelectedBoard(firstBoard.id);
            router.push(`/boards/${firstBoard.id}`);
          } else {
            // No boards left, navigate to boards index
            console.log('No boards remaining, navigating to /boards');
            setSelectedBoard(null);

            // Invalidate the post-login route query to prevent AuthRedirect from interfering
            queryClient.invalidateQueries({ queryKey: ['postLoginRoute'] });
            router.push('/boards');
          }
        }

        console.log('Board deleted successfully');
        toast.success('Board deleted successfully!');
      } catch (error) {
        console.error('Error in delete navigation:', error);
        // Fallback navigation
        setSelectedBoard(null);

        // Invalidate the post-login route query to prevent AuthRedirect from interfering
        queryClient.invalidateQueries({ queryKey: ['postLoginRoute'] });

        // Invalidate selected board data since no boards remain
        invalidateSelectedBoard();

        router.push('/boards');
      }
    },
    onError: (error, deletedBoardId, context) => {
      // Rollback optimistic update on error
      if (context?.previousBoards) {
        queryClient.setQueryData(['boards'], context.previousBoards);
      }

      console.error('Delete board failed:', error);
      toast.error('Failed to delete board. Please try again.');
    },
    onSettled: () => {
      // Ensure we have fresh data after the mutation
      queryClient.invalidateQueries({ queryKey: ['boards'] });
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

  const createColumnMutation = useMutation<
    ColumnResponse,
    Error,
    { boardId: string; data: CreateColumnRequest }
  >({
    mutationFn: async ({ boardId, data }) => {
      const res = await fetch(`/api/columns?boardId=${boardId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage =
          errorData.error || errorData.message || 'Failed to create column';
        throw new Error(errorMessage);
      }
      const responseData: ApiResponse<ColumnResponse> = await res.json();
      return responseData.data!;
    },
    onSuccess: (newColumn) => {
      // Invalidate board queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({
        queryKey: ['boards', newColumn.boardId],
      });
      queryClient.invalidateQueries({
        queryKey: ['selectedBoardData', newColumn.boardId],
      });

      invalidateSelectedBoard();
      refetchSelectedBoard();

      toast.success('Column created successfully!');
    },
    onError: (error) => {
      console.error('Create column failed:', error);
      if (
        error.message.includes('duplicate key') ||
        error.message.includes('already exists')
      ) {
        toast.error(
          'A column with this name already exists. Please choose a different name.',
        );
      } else {
        toast.error('Failed to create column. Please try again.');
      }
    },
  });

  return {
    boards: boardsQuery.data || [],
    isLoading: boardsQuery.isLoading,
    error: boardsQuery.error?.message || null,

    useBoardQuery,

    createBoard: (data: CreateBoardWithColumnsRequest) =>
      createBoardMutation.mutate(data),
    updateBoard: (boardId: string, data: UpdateBoardRequest) =>
      updateBoardMutation.mutate({ boardId, data }),
    deleteBoard: (boardId: string) => deleteBoardMutation.mutate(boardId),
    reorderBoards: (data: ReorderRequest) => reorderBoardsMutation.mutate(data),
    setDefaultBoard: (boardId: string) =>
      setDefaultBoardMutation.mutate(boardId),
    createColumn: (data: { boardId: string; name: string; color?: string }) =>
      createColumnMutation.mutate({
        boardId: data.boardId,
        data: { name: data.name, color: data.color },
      }),

    isCreating: createBoardMutation.isPending,
    isUpdating: updateBoardMutation.isPending,
    isDeleting: deleteBoardMutation.isPending,
    isReordering: reorderBoardsMutation.isPending,
    isSettingDefault: setDefaultBoardMutation.isPending,
    isCreatingColumn: createColumnMutation.isPending,

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
