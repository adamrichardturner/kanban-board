import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { ApiResponse, HTTP_STATUS } from '@/types';
import {
  TaskResponse,
  TaskWithSubtasks,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
  ReorderRequest,
} from '@/types/kanban';
import { TaskService } from '@/services/task.service';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async getColumnTasks(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const columnId = url.searchParams.get('columnId');

      if (!columnId) {
        const errorResponse: ApiResponse = {
          error: 'Column ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const tasks = await this.taskService.getColumnTasks(columnId, userId);

      const response: ApiResponse<TaskResponse[]> = {
        data: tasks,
        message: 'Tasks retrieved successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to get tasks');
    }
  }

  async getTask(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const taskId = url.pathname.split('/').pop();

      if (!taskId) {
        const errorResponse: ApiResponse = {
          error: 'Task ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const task = await this.taskService.getTaskWithSubtasks(taskId, userId);

      if (!task) {
        const errorResponse: ApiResponse = {
          error: 'Task not found',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.NOT_FOUND,
        });
      }

      const response: ApiResponse<TaskWithSubtasks> = {
        data: task,
        message: 'Task retrieved successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to get task');
    }
  }

  async createTask(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const boardId = url.searchParams.get('boardId');
      const data: CreateTaskRequest = await request.json();

      if (!boardId) {
        const errorResponse: ApiResponse = {
          error: 'Board ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      if (!data.columnId || !data.title?.trim()) {
        const errorResponse: ApiResponse = {
          error: 'Column ID and task title are required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      // Validate subtasks if provided
      if (data.subtasks && Array.isArray(data.subtasks)) {
        for (const subtask of data.subtasks) {
          if (!subtask.title?.trim()) {
            const errorResponse: ApiResponse = {
              error: 'All subtasks must have a title',
            };
            return NextResponse.json(errorResponse, {
              status: HTTP_STATUS.BAD_REQUEST,
            });
          }
        }
      }

      const task = await this.taskService.createTask(boardId, userId, data);

      const response: ApiResponse<TaskResponse> = {
        data: task,
        message: 'Task created successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.CREATED });
    } catch (error) {
      return this.handleError(error, 'Failed to create task');
    }
  }

  async createTaskWithSubtasks(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const boardId = url.searchParams.get('boardId');
      const data: CreateTaskRequest = await request.json();

      if (!boardId) {
        const errorResponse: ApiResponse = {
          error: 'Board ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      if (!data.columnId || !data.title?.trim()) {
        const errorResponse: ApiResponse = {
          error: 'Column ID and task title are required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      // Validate subtasks if provided
      if (data.subtasks && Array.isArray(data.subtasks)) {
        for (const subtask of data.subtasks) {
          if (!subtask.title?.trim()) {
            const errorResponse: ApiResponse = {
              error: 'All subtasks must have a title',
            };
            return NextResponse.json(errorResponse, {
              status: HTTP_STATUS.BAD_REQUEST,
            });
          }
        }
      }

      const taskWithSubtasks = await this.taskService.createTaskWithSubtasks(
        boardId,
        userId,
        data,
      );

      const response: ApiResponse<TaskWithSubtasks> = {
        data: taskWithSubtasks,
        message: 'Task with subtasks created successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.CREATED });
    } catch (error) {
      return this.handleError(error, 'Failed to create task with subtasks');
    }
  }

  async updateTask(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const taskId = url.pathname.split('/').pop();
      const data: UpdateTaskRequest = await request.json();

      if (!taskId) {
        const errorResponse: ApiResponse = {
          error: 'Task ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const task = await this.taskService.updateTask(taskId, userId, data);

      if (!task) {
        const errorResponse: ApiResponse = {
          error: 'Task not found',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.NOT_FOUND,
        });
      }

      const response: ApiResponse<TaskResponse> = {
        data: task,
        message: 'Task updated successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to update task');
    }
  }

  async deleteTask(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const taskId = url.pathname.split('/').pop();

      if (!taskId) {
        const errorResponse: ApiResponse = {
          error: 'Task ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const deleted = await this.taskService.deleteTask(taskId, userId);

      if (!deleted) {
        const errorResponse: ApiResponse = {
          error: 'Task not found',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.NOT_FOUND,
        });
      }

      const response: ApiResponse = {
        message: 'Task deleted successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to delete task');
    }
  }

  async moveTask(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const taskId = url.pathname.split('/')[3]; // Extract from /api/tasks/{id}/move
      const data: MoveTaskRequest = await request.json();

      if (!taskId) {
        const errorResponse: ApiResponse = {
          error: 'Task ID is required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      if (!data.columnId || data.position === undefined) {
        const errorResponse: ApiResponse = {
          error: 'Column ID and position are required',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const task = await this.taskService.moveTask(taskId, userId, data);

      if (!task) {
        const errorResponse: ApiResponse = {
          error: 'Task not found',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.NOT_FOUND,
        });
      }

      const response: ApiResponse<TaskResponse> = {
        data: task,
        message: 'Task moved successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to move task');
    }
  }

  async reorderTasks(request: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.getUserId();
      const url = new URL(request.url);
      const columnId = url.searchParams.get('columnId');
      const data: ReorderRequest = await request.json();

      if (!columnId) {
        const errorResponse: ApiResponse = {
          error: 'Column ID is required',
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

      await this.taskService.reorderTasks(columnId, userId, data);

      const response: ApiResponse = {
        message: 'Tasks reordered successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      return this.handleError(error, 'Failed to reorder tasks');
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
    console.error('Task controller error:', error);

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
