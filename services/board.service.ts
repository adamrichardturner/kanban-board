import { BoardRepository } from '@/repositories/board.repository';
import { ColumnRepository } from '@/repositories/column.repository';
import { TaskRepository } from '@/repositories/task.repository';
import { SubtaskRepository } from '@/repositories/subtask.repository';
import {
  Board,
  Column,
  Task,
  Subtask,
  BoardResponse,
  BoardWithColumns,
  ColumnWithTasks,
  TaskResponse,
  SubtaskResponse,
  CreateBoardRequest,
  UpdateBoardRequest,
  ReorderRequest,
  ColumnResponse,
} from '@/types/kanban';

interface BoardUpdateFields {
  name?: string;
  is_default?: boolean;
  position?: number;
}

export class BoardService {
  private boardRepository: BoardRepository;
  private columnRepository: ColumnRepository;
  private taskRepository: TaskRepository;
  private subtaskRepository: SubtaskRepository;

  constructor() {
    this.boardRepository = new BoardRepository();
    this.columnRepository = new ColumnRepository();
    this.taskRepository = new TaskRepository();
    this.subtaskRepository = new SubtaskRepository();
  }

  async getUserBoards(userId: string): Promise<BoardResponse[]> {
    const boards = await this.boardRepository.findByUserId(userId);
    return boards.map((board) => this.mapBoardResponse(board));
  }

  async getBoardWithColumns(
    boardId: string,
    userId: string,
  ): Promise<BoardWithColumns | null> {
    const board = await this.boardRepository.findById(boardId, userId);
    if (!board) {
      return null;
    }

    const columns = await this.columnRepository.findByBoardId(boardId);
    const tasks = await this.taskRepository.findByBoardId(boardId);

    // Group tasks by column
    const tasksByColumn: Record<string, Task[]> = tasks.reduce(
      (acc, task) => {
        if (!acc[task.column_id]) {
          acc[task.column_id] = [];
        }
        acc[task.column_id].push(task);
        return acc;
      },
      {} as Record<string, Task[]>,
    );

    // Get all subtasks for the board
    const allSubtasks = await Promise.all(
      tasks.map((task) => this.subtaskRepository.findByTaskId(task.id)),
    );
    const subtasksByTask: Record<string, Subtask[]> = allSubtasks.flat().reduce(
      (acc, subtask) => {
        if (!acc[subtask.task_id]) {
          acc[subtask.task_id] = [];
        }
        acc[subtask.task_id].push(subtask);
        return acc;
      },
      {} as Record<string, Subtask[]>,
    );

    const columnsWithTasks: ColumnWithTasks[] = columns.map((column) => ({
      ...this.mapColumnResponse(column),
      tasks: (tasksByColumn[column.id] || []).map((task) => ({
        ...this.mapTaskResponse(task),
        subtasks: (subtasksByTask[task.id] || []).map((subtask) =>
          this.mapSubtaskResponse(subtask),
        ),
      })),
    }));

    return {
      ...this.mapBoardResponse(board),
      columns: columnsWithTasks,
    };
  }

  async createBoard(
    userId: string,
    data: CreateBoardRequest,
  ): Promise<BoardResponse> {
    const board = await this.boardRepository.create(
      userId,
      data.name,
      data.isDefault,
    );

    // If this is set as default, ensure no other boards are default
    if (data.isDefault) {
      await this.boardRepository.setDefault(board.id, userId);
    }

    return this.mapBoardResponse(board);
  }

  async updateBoard(
    boardId: string,
    userId: string,
    data: UpdateBoardRequest,
  ): Promise<BoardResponse | null> {
    const updates: BoardUpdateFields = {};

    if (data.name !== undefined) {
      updates.name = data.name;
    }
    if (data.position !== undefined) {
      updates.position = data.position;
    }
    if (data.isDefault !== undefined) {
      updates.is_default = data.isDefault;
    }

    const board = await this.boardRepository.update(boardId, userId, updates);
    if (!board) {
      return null;
    }

    // If this is set as default, ensure no other boards are default
    if (data.isDefault) {
      await this.boardRepository.setDefault(boardId, userId);
    }

    return this.mapBoardResponse(board);
  }

  async deleteBoard(boardId: string, userId: string): Promise<boolean> {
    return await this.boardRepository.delete(boardId, userId);
  }

  async reorderBoards(userId: string, data: ReorderRequest): Promise<void> {
    await this.boardRepository.reorderBoards(userId, data.items);
  }

  async setDefaultBoard(boardId: string, userId: string): Promise<void> {
    // Verify the board exists and belongs to the user
    const board = await this.boardRepository.findById(boardId, userId);
    if (!board) {
      throw new Error('Board not found');
    }

    await this.boardRepository.setDefault(boardId, userId);
  }

  // Helper methods to map database objects to response objects
  private mapBoardResponse(board: Board): BoardResponse {
    return {
      id: board.id,
      userId: board.user_id,
      name: board.name,
      isDefault: board.is_default,
      position: board.position,
      createdAt: board.created_at,
      updatedAt: board.updated_at,
    };
  }

  private mapColumnResponse(column: Column): ColumnResponse {
    return {
      id: column.id,
      boardId: column.board_id,
      name: column.name,
      position: column.position,
      color: column.color,
      createdAt: column.created_at,
      updatedAt: column.updated_at,
    };
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
