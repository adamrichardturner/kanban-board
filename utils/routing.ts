import { ApiResponse, BoardResponse } from '@/types';

export async function getPostLoginRoute(): Promise<string> {
  try {
    const res = await fetch('/api/boards');
    if (!res.ok) {
      return '/boards';
    }

    const data: ApiResponse<BoardResponse[]> = await res.json();
    const boards = data.data;

    if (boards && boards.length > 0) {
      // Sort by position and get the first board
      const sortedBoards = boards.sort((a, b) => a.position - b.position);
      return `/boards/${sortedBoards[0].id}`;
    }

    return '/boards';
  } catch (error) {
    console.error('Failed to determine post-login route:', error);
    return '/boards';
  }
}
