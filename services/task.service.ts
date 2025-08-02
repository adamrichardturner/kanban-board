import { TaskRepository } from '@/repositories/task.repository';
import { ColumnRepository } from '@/repositories/column.repository';
import { BoardRepository } from '@/repositories/board.repository';
import { SubtaskRepository } from '@/repositories/subtask.repository';
import {
  Task,
  Subtask,
  TaskResponse,
  TaskWithSubtasks,
  SubtaskResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
  ReorderRequest,
  TaskStatus,
} from '@/types/kanban';

interface TaskUpdateFields {
  title?: string;
  description?: string;
  status?: TaskStatus;
  position?: number;
  column_id?: string;
}

export class TaskService {
  private taskRepository: TaskRepository;
  private columnRepository: ColumnRepository;
  private boardRepository: BoardRepository;
  private subtaskRepository: SubtaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.columnRepository = new ColumnRepository();
    this.boardRepository = new BoardRepository();
    this.subtaskRepository = new SubtaskRepository();
  }

  async getColumnTasks(
    columnId: string,
    userId: string,
  ): Promise<TaskResponse[]> {
    // Verify user owns the board that contains this column
    const hasAccess = await this.columnRepository.verifyBoardOwnership(
      columnId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Column not found or access denied');
    }

    const tasks = await this.taskRepository.findByColumnId(columnId);
    return tasks.map((task) => this.mapTaskResponse(task));
  }

  async getTaskWithSubtasks(
    taskId: string,
    userId: string,
  ): Promise<TaskWithSubtasks | null> {
    // Verify user owns the board that contains this task
    const hasAccess = await this.taskRepository.verifyBoardOwnership(
      taskId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Task not found or access denied');
    }

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      return null;
    }

    const subtasks = await this.subtaskRepository.findByTaskId(taskId);

    return {
      ...this.mapTaskResponse(task),
      subtasks: subtasks.map((subtask) => this.mapSubtaskResponse(subtask)),
    };
  }

  async createTask(
    boardId: string,
    userId: string,
    data: CreateTaskRequest,
  ): Promise<TaskResponse> {
    // Verify user owns the board
    const board = await this.boardRepository.findById(boardId, userId);
    if (!board) {
      throw new Error('Board not found');
    }

    // Verify the column belongs to the board
    const column = await this.columnRepository.findById(data.columnId);
    if (!column || column.board_id !== boardId) {
      throw new Error('Column not found or does not belong to the board');
    }

    // Prepare subtasks data if provided
    const subtasksData =
      data.subtasks?.map((subtask) => ({
        title: subtask.title,
        status: subtask.status || ('todo' as TaskStatus),
      })) || [];

    // Create task with subtasks
    if (subtasksData.length > 0) {
      const { task } = await this.taskRepository.createWithSubtasks(
        boardId,
        data.columnId,
        data.title,
        data.description,
        data.status,
        subtasksData,
      );
      return this.mapTaskResponse(task);
    } else {
      // Create task without subtasks (original behavior)
      const task = await this.taskRepository.create(
        boardId,
        data.columnId,
        data.title,
        data.description,
        data.status,
      );
      return this.mapTaskResponse(task);
    }
  }

  async createTaskWithSubtasks(
    boardId: string,
    userId: string,
    data: CreateTaskRequest,
  ): Promise<TaskWithSubtasks> {
    // Verify user owns the board
    const board = await this.boardRepository.findById(boardId, userId);
    if (!board) {
      throw new Error('Board not found');
    }

    // Verify the column belongs to the board
    const column = await this.columnRepository.findById(data.columnId);
    if (!column || column.board_id !== boardId) {
      throw new Error('Column not found or does not belong to the board');
    }

    // Prepare subtasks data if provided
    const subtasksData =
      data.subtasks?.map((subtask) => ({
        title: subtask.title,
        status: subtask.status || ('todo' as TaskStatus),
      })) || [];

    // Create task with subtasks
    const { task, subtasks } = await this.taskRepository.createWithSubtasks(
      boardId,
      data.columnId,
      data.title,
      data.description,
      data.status,
      subtasksData,
    );

    return {
      ...this.mapTaskResponse(task),
      subtasks: subtasks.map((subtask) => this.mapSubtaskResponse(subtask)),
    };
  }

  async updateTask(
    taskId: string,
    userId: string,
    data: UpdateTaskRequest,
  ): Promise<TaskResponse | null> {
    // Verify user owns the board that contains this task
    const hasAccess = await this.taskRepository.verifyBoardOwnership(
      taskId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Task not found or access denied');
    }

    const updates: TaskUpdateFields = {};
    if (data.title !== undefined) {
      updates.title = data.title;
    }
    if (data.description !== undefined) {
      updates.description = data.description;
    }
    if (data.status !== undefined) {
      updates.status = data.status;
    }
    if (data.position !== undefined) {
      updates.position = data.position;
    }

    // If moving to a different column, verify the new column exists and belongs to the same board
    if (data.columnId !== undefined) {
      const boardId = await this.taskRepository.getBoardIdByTaskId(taskId);
      const column = await this.columnRepository.findById(data.columnId);

      if (!column || column.board_id !== boardId) {
        throw new Error(
          'Target column not found or does not belong to the same board',
        );
      }

      updates.column_id = data.columnId;
    }

    const task = await this.taskRepository.update(taskId, updates);
    if (!task) {
      return null;
    }

    return this.mapTaskResponse(task);
  }

  async deleteTask(taskId: string, userId: string): Promise<boolean> {
    // Verify user owns the board that contains this task
    const hasAccess = await this.taskRepository.verifyBoardOwnership(
      taskId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Task not found or access denied');
    }

    return await this.taskRepository.delete(taskId);
  }

  async moveTask(
    taskId: string,
    userId: string,
    data: MoveTaskRequest,
  ): Promise<TaskResponse | null> {
    // Verify user owns the board that contains this task
    const hasAccess = await this.taskRepository.verifyBoardOwnership(
      taskId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Task not found or access denied');
    }

    // Verify the target column exists and belongs to the same board
    const boardId = await this.taskRepository.getBoardIdByTaskId(taskId);
    const column = await this.columnRepository.findById(data.columnId);

    if (!column || column.board_id !== boardId) {
      throw new Error(
        'Target column not found or does not belong to the same board',
      );
    }

    const task = await this.taskRepository.moveToColumn(
      taskId,
      data.columnId,
      data.position,
    );

    if (!task) {
      return null;
    }

    return this.mapTaskResponse(task);
  }

  async reorderTasks(
    columnId: string,
    userId: string,
    data: ReorderRequest,
  ): Promise<void> {
    // Verify user owns the board that contains this column
    const hasAccess = await this.columnRepository.verifyBoardOwnership(
      columnId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Column not found or access denied');
    }

    await this.taskRepository.reorderTasks(columnId, data.items);
  }

  private mapTaskResponse(task: Task): TaskResponse {
    return {
      id: task.id,
      boardId: task.board_id,
      columnId: task.column_id,
      title: task.title,
      description: task.description,
      status: task.status,
      position: task.position,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    };
  }

  private mapSubtaskResponse(subtask: Subtask): SubtaskResponse {
    return {
      id: subtask.id,
      taskId: subtask.task_id,
      title: subtask.title,
      status: subtask.status,
      position: subtask.position,
      createdAt: subtask.created_at,
      updatedAt: subtask.updated_at,
    };
  }
}
