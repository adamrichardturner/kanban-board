import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BoardWithColumns } from '@/types';
import { useMemo } from 'react';

export function useSelectedBoard() {
  const queryClient = useQueryClient();

  const selectedBoardQuery = useQuery<string | null>({
    queryKey: ['selectedBoard'],
    queryFn: () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('selectedBoardId');
      }
      return null;
    },
    staleTime: 0,
    gcTime: 0,
  });

  const selectedBoardData = useQuery<BoardWithColumns | null>({
    queryKey: ['selectedBoardData', selectedBoardQuery.data],
    queryFn: async () => {
      const boardId = selectedBoardQuery.data;
      if (!boardId) return null;

      // Always fetch fresh data from API - no cache lookup
      // This ensures EditBoardDialog always gets current column data
      try {
        console.log('Fetching fresh board data for:', boardId);
        const res = await fetch(`/api/boards/${boardId}`);
        if (!res.ok) return null;

        const data = await res.json();
        console.log(
          'Fresh board data received:',
          data.data?.name,
          'columns:',
          data.data?.columns?.length,
        );
        return data.data;
      } catch (error) {
        console.error('Failed to fetch selected board:', error);
        return null;
      }
    },
    enabled: !!selectedBoardQuery.data,
    staleTime: 0, // Always refetch when invalidated - ensures fresh column data
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  // Ensure selectedBoardId is always a string
  const selectedBoardId: string = useMemo(() => {
    return selectedBoardQuery.data || '';
  }, [selectedBoardQuery.data]);

  // Find the todo column ID from the selected board
  const todoColumnId: string = useMemo(() => {
    const board = selectedBoardData.data;
    if (!board?.columns || board.columns.length === 0) {
      return '';
    }

    // Try to find todo column by name (case insensitive)
    const todoColumn = board.columns.find((column) => {
      const columnName = column.name.toLowerCase().trim();
      return (
        columnName === 'todo' ||
        columnName === 'to do' ||
        columnName === 'to-do' ||
        columnName === 'backlog' ||
        columnName.includes('todo') ||
        columnName.includes('to do')
      );
    });

    // If found by name, return its ID
    if (todoColumn) {
      return todoColumn.id;
    }

    // Fallback: return the first column (usually the leftmost/starting column)
    const sortedColumns = [...board.columns].sort(
      (a, b) => a.position - b.position,
    );
    return sortedColumns[0]?.id || '';
  }, [selectedBoardData.data]);

  const setSelectedBoard = (boardId: string | null) => {
    queryClient.setQueryData(['selectedBoard'], boardId);

    if (typeof window !== 'undefined') {
      if (boardId) {
        localStorage.setItem('selectedBoardId', boardId);
      } else {
        localStorage.removeItem('selectedBoardId');
      }
    }
  };

  const clearSelectedBoard = () => {
    setSelectedBoard(null);
  };

  const refetchSelectedBoard = () => {
    // Force refetch of selected board data
    return selectedBoardData.refetch();
  };

  const invalidateSelectedBoard = () => {
    // Invalidate all selectedBoardData queries to ensure fresh data
    queryClient.invalidateQueries({
      queryKey: ['selectedBoardData'],
    });
  };

  return {
    selectedBoardId, // ← Now always returns a string (empty string if none selected)
    selectedBoard: selectedBoardData.data,
    todoColumnId, // ← Always returns a string (empty string if no todo column)
    isLoadingSelection:
      selectedBoardQuery.isLoading || selectedBoardData.isLoading,
    setSelectedBoard,
    clearSelectedBoard,
    refetchSelectedBoard,
    invalidateSelectedBoard,
  };
}
