import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BoardWithColumns } from '@/types';

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
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const selectedBoardData = useQuery<BoardWithColumns | null>({
    queryKey: ['selectedBoardData', selectedBoardQuery.data],
    queryFn: async () => {
      const boardId = selectedBoardQuery.data;
      if (!boardId) return null;

      const cachedBoard = queryClient.getQueryData<BoardWithColumns>([
        'boards',
        boardId,
      ]);
      if (cachedBoard) return cachedBoard;

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
    staleTime: 1000 * 60 * 5,
  });

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

  return {
    selectedBoardId: selectedBoardQuery.data,
    selectedBoard: selectedBoardData.data,
    isLoadingSelection:
      selectedBoardQuery.isLoading || selectedBoardData.isLoading,
    setSelectedBoard,
    clearSelectedBoard,
  };
}
