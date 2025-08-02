import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { ApiResponse, HTTP_STATUS } from '@/types';
import {
  ColumnResponse,
  CreateColumnRequest,
  UpdateColumnRequest,
  ReorderRequest,
} from '@/types/kanban';
import { ColumnService } from '@/services/column.service';

export class ColumnController {
  private columnService: ColumnService;

  constructor() {
    this.columnService = new ColumnService();
  }

  async getBoardColumns(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const boardId = url.searchParams.get('boardId');

      if (!boardId) {
        const errorResponse: ApiResponse = {
          error: 'Board ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const columns = await this.columnService.getBoardColumns(boardId, userId);

      const response: ApiResponse<ColumnResponse[]> = {
        data: columns,
        message: 'Columns retrieved successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to get columns');
    }
  }

  async createColumn(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const boardId = url.searchParams.get('boardId');
      const data: CreateColumnRequest = await request.json();

      if (!boardId) {
        const errorResponse: ApiResponse = {
          error: 'Board ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      if (!data.name?.trim()) {
        const errorResponse: ApiResponse = {
          error: 'Column name is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const column = await this.columnService.createColumn(
        boardId,
        userId,
        data,
      );

      const response: ApiResponse<ColumnResponse> = {
        data: column,
        message: 'Column created successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.CREATED });
    } catch (error) {
      return this.handleError(error, 'Failed to create column');
    }
  }

  async updateColumn(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const columnId = url.pathname.split('/').pop();
      const data: UpdateColumnRequest = await request.json();

      if (!columnId) {
        const errorResponse: ApiResponse = {
          error: 'Column ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const column = await this.columnService.updateColumn(
        columnId,
        userId,
        data,
      );

      if (!column) {
        const errorResponse: ApiResponse = {
          error: 'Column not found',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.NOT_FOUND,
        });
      }

      const response: ApiResponse<ColumnResponse> = {
        data: column,
        message: 'Column updated successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to update column');
    }
  }

  async deleteColumn(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const columnId = url.pathname.split('/').pop();

      if (!columnId) {
        const errorResponse: ApiResponse = {
          error: 'Column ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const deleted = await this.columnService.deleteColumn(columnId, userId);

      if (!deleted) {
        const errorResponse: ApiResponse = {
          error: 'Column not found',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.NOT_FOUND,
        });
      }

      const response: ApiResponse = {
        message: 'Column deleted successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to delete column');
    }
  }

  async reorderColumns(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const boardId = url.searchParams.get('boardId');
      const data: ReorderRequest = await request.json();

      if (!boardId) {
        const errorResponse: ApiResponse = {
          error: 'Board ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      if (!data.items || !Array.isArray(data.items)) {
        const errorResponse: ApiResponse = {
          error: 'Items array is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      await this.columnService.reorderColumns(boardId, userId, data);

      const response: ApiResponse = {
        message: 'Columns reordered successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to reorder columns');
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
    console.error('Column controller error:', error);

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
