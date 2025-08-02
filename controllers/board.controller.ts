import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { ApiResponse, HTTP_STATUS } from '@/types';
import {
  BoardResponse,
  BoardWithColumns,
  CreateBoardRequest,
  UpdateBoardRequest,
  ReorderRequest,
} from '@/types/kanban';
import { BoardService } from '@/services/board.service';

export class BoardController {
  private boardService: BoardService;

  constructor() {
    this.boardService = new BoardService();
  }

  async getBoards(): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const boards = await this.boardService.getUserBoards(userId);

      const response: ApiResponse<BoardResponse[]> = {
        data: boards,
        message: 'Boards retrieved successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to get boards');
    }
  }

  async getBoard(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const boardId = url.pathname.split('/').pop();

      if (!boardId) {
        const errorResponse: ApiResponse = {
          error: 'Board ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const board = await this.boardService.getBoardWithColumns(
        boardId,
        userId,
      );

      if (!board) {
        const errorResponse: ApiResponse = {
          error: 'Board not found',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.NOT_FOUND,
        });
      }

      const response: ApiResponse<BoardWithColumns> = {
        data: board,
        message: 'Board retrieved successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to get board');
    }
  }

  async createBoard(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const data: CreateBoardRequest = await request.json();

      if (!data.name?.trim()) {
        const errorResponse: ApiResponse = {
          error: 'Board name is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const board = await this.boardService.createBoard(userId, data);

      const response: ApiResponse<BoardResponse> = {
        data: board,
        message: 'Board created successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.CREATED });
    } catch (error) {
      return this.handleError(error, 'Failed to create board');
    }
  }

  async updateBoard(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const boardId = url.pathname.split('/').pop();
      const data: UpdateBoardRequest = await request.json();

      if (!boardId) {
        const errorResponse: ApiResponse = {
          error: 'Board ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const board = await this.boardService.updateBoard(boardId, userId, data);

      if (!board) {
        const errorResponse: ApiResponse = {
          error: 'Board not found',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.NOT_FOUND,
        });
      }

      const response: ApiResponse<BoardResponse> = {
        data: board,
        message: 'Board updated successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to update board');
    }
  }

  async deleteBoard(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const boardId = url.pathname.split('/').pop();

      if (!boardId) {
        const errorResponse: ApiResponse = {
          error: 'Board ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const deleted = await this.boardService.deleteBoard(boardId, userId);

      if (!deleted) {
        const errorResponse: ApiResponse = {
          error: 'Board not found',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.NOT_FOUND,
        });
      }

      const response: ApiResponse = {
        message: 'Board deleted successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to delete board');
    }
  }

  async reorderBoards(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const data: ReorderRequest = await request.json();

      if (!data.items || !Array.isArray(data.items)) {
        const errorResponse: ApiResponse = {
          error: 'Items array is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      await this.boardService.reorderBoards(userId, data);

      const response: ApiResponse = {
        message: 'Boards reordered successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to reorder boards');
    }
  }

  async setDefaultBoard(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const boardId = url.pathname.split('/')[3]; // Extract from /api/boards/{id}/default

      if (!boardId) {
        const errorResponse: ApiResponse = {
          error: 'Board ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      await this.boardService.setDefaultBoard(boardId, userId);

      const response: ApiResponse = {
        message: 'Default board set successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to set default board');
    }
  }

  private async getUserId(): Promise<string> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      throw new Error('Invalid token');
    }

    return decoded.userId;
  }

  private handleError(error: unknown, fallbackMessage: string): NextResponse {
    console.error('Board controller error:', error);

    const errorMessage =
      error instanceof Error ? error.message : fallbackMessage;
    const statusCode = this.getErrorStatusCode(errorMessage);

    const errorResponse: ApiResponse = {
      error: errorMessage,
    };

    return NextResponse.json(errorResponse, { status: statusCode });
  }

  private getErrorStatusCode(errorMessage: string): number {
    if (errorMessage.includes('not found')) {
      return HTTP_STATUS.NOT_FOUND;
    }
    if (
      errorMessage.includes('access denied') ||
      errorMessage.includes('token')
    ) {
      return HTTP_STATUS.UNAUTHORIZED;
    }
    if (errorMessage.includes('required') || errorMessage.includes('Invalid')) {
      return HTTP_STATUS.BAD_REQUEST;
    }
    return HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }
}
