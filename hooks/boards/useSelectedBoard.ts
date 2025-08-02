import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BoardWithColumns } from '@/types';

export function useSelectedBoard() {
  const queryClient = useQueryClient();

  // Query to store the selected board ID
  const selectedBoardQuery = useQuery<string | null>({
    queryKey: ['selectedBoard'],
    queryFn: () => {
      // Get from localStorage as fallback for persistence
      if (typeof window !== 'undefined') {
        return localStorage.getItem('selectedBoardId');
      }
      return null;
    },
    staleTime: Infinity, // Never becomes stale
    gcTime: Infinity, // Never garbage collected
  });

  // Get the full board data for the selected board
  const selectedBoardData = useQuery<BoardWithColumns | null>({
    queryKey: ['selectedBoardData', selectedBoardQuery.data],
    queryFn: async () => {
      const boardId = selectedBoardQuery.data;
      if (!boardId) return null;

      // First try to get from cache
      const cachedBoard = queryClient.getQueryData<BoardWithColumns>([
        'boards',
        boardId,
      ]);
      if (cachedBoard) return cachedBoard;

      // If not in cache, fetch it
      try {
        const res = await fetch(`/api/boards/${boardId}`);
        if (!res.ok) return null;

        const data = await res.json();
        return data.data;
      } catch (error) {
        console.error('Failed to fetch selected board:', error);
        return null;
      }
    },
    enabled: !!selectedBoardQuery.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const setSelectedBoard = (boardId: string | null) => {
    // Update the query cache
    queryClient.setQueryData(['selectedBoard'], boardId);

    // Persist to localStorage
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

  return {
    selectedBoardId: selectedBoardQuery.data,
    selectedBoard: selectedBoardData.data,
    isLoadingSelection:
      selectedBoardQuery.isLoading || selectedBoardData.isLoading,
    setSelectedBoard,
    clearSelectedBoard,
  };
}
