import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BoardWithColumns } from '@/types';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

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

  const pathname = usePathname();
  const routeBoardId = useMemo(() => {
    if (!pathname) {
      return '';
    }
    const match = pathname.match(/^\/boards\/([^\/]+)/);
    if (!match) {
      return '';
    }
    return match[1];
  }, [pathname]);

  const effectiveSelectedBoardId = useMemo(() => {
    if (routeBoardId) {
      return routeBoardId;
    }
    return selectedBoardQuery.data || '';
  }, [routeBoardId, selectedBoardQuery.data]);

  const selectedBoardData = useQuery<BoardWithColumns | null>({
    // Share the same key as useBoard(boardId) to avoid duplicate fetches
    queryKey: ['boards', effectiveSelectedBoardId],
    queryFn: async () => {
      const boardId = effectiveSelectedBoardId;
      if (!boardId) {
        return null;
      }

      try {
        const res = await fetch(`/api/boards/${boardId}`);
        if (!res.ok) {
          return null;
        }
        const data = (await res.json()) as { data: BoardWithColumns | null };
        return data.data ?? null;
      } catch (error) {
        console.error('Failed to fetch selected board:', error);
        return null;
      }
    },
    enabled: !!effectiveSelectedBoardId,
    // Cache briefly to avoid duplicate calls across components on mount
    staleTime: 1000 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Ensure selectedBoardId is always a string
  const selectedBoardId: string = useMemo(() => {
    return effectiveSelectedBoardId;
  }, [effectiveSelectedBoardId]);

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
    // Invalidate board detail queries so consumers refetch as needed
    if (selectedBoardId) {
      queryClient.invalidateQueries({ queryKey: ['boards', selectedBoardId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    }
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
