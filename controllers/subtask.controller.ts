import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { ApiResponse, HTTP_STATUS } from '@/types';
import {
  SubtaskResponse,
  CreateSubtaskRequest,
  UpdateSubtaskRequest,
  ReorderRequest,
} from '@/types/kanban';
import { SubtaskService } from '@/services/subtask.service';

export class SubtaskController {
  private subtaskService: SubtaskService;

  constructor() {
    this.subtaskService = new SubtaskService();
  }

  async getTaskSubtasks(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const taskId = url.searchParams.get('taskId');

      if (!taskId) {
        const errorResponse: ApiResponse = {
          error: 'Task ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const subtasks = await this.subtaskService.getTaskSubtasks(
        taskId,
        userId,
      );

      const response: ApiResponse<SubtaskResponse[]> = {
        data: subtasks,
        message: 'Subtasks retrieved successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to get subtasks');
    }
  }

  async createSubtask(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const taskId = url.searchParams.get('taskId');
      const data: CreateSubtaskRequest = await request.json();

      if (!taskId) {
        const errorResponse: ApiResponse = {
          error: 'Task ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      if (!data.title?.trim()) {
        const errorResponse: ApiResponse = {
          error: 'Subtask title is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const subtask = await this.subtaskService.createSubtask(
        taskId,
        userId,
        data,
      );

      const response: ApiResponse<SubtaskResponse> = {
        data: subtask,
        message: 'Subtask created successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.CREATED });
    } catch (error) {
      return this.handleError(error, 'Failed to create subtask');
    }
  }

  async updateSubtask(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const subtaskId = url.pathname.split('/').pop();
      const data: UpdateSubtaskRequest = await request.json();

      if (!subtaskId) {
        const errorResponse: ApiResponse = {
          error: 'Subtask ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const subtask = await this.subtaskService.updateSubtask(
        subtaskId,
        userId,
        data,
      );

      if (!subtask) {
        const errorResponse: ApiResponse = {
          error: 'Subtask not found',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.NOT_FOUND,
        });
      }

      const response: ApiResponse<SubtaskResponse> = {
        data: subtask,
        message: 'Subtask updated successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to update subtask');
    }
  }

  async deleteSubtask(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const subtaskId = url.pathname.split('/').pop();

      if (!subtaskId) {
        const errorResponse: ApiResponse = {
          error: 'Subtask ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const deleted = await this.subtaskService.deleteSubtask(
        subtaskId,
        userId,
      );

      if (!deleted) {
        const errorResponse: ApiResponse = {
          error: 'Subtask not found',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.NOT_FOUND,
        });
      }

      const response: ApiResponse = {
        message: 'Subtask deleted successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to delete subtask');
    }
  }

  async reorderSubtasks(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const taskId = url.searchParams.get('taskId');
      const data: ReorderRequest = await request.json();

      if (!taskId) {
        const errorResponse: ApiResponse = {
          error: 'Task ID is required',
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

      await this.subtaskService.reorderSubtasks(taskId, userId, data);

      const response: ApiResponse = {
        message: 'Subtasks reordered successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to reorder subtasks');
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
    console.error('Subtask controller error:', error);

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
