import { ColumnRepository } from '@/repositories/column.repository';
import { BoardRepository } from '@/repositories/board.repository';
import {
  Column,
  ColumnResponse,
  CreateColumnRequest,
  UpdateColumnRequest,
  ReorderRequest,
} from '@/types/kanban';

interface ColumnUpdateFields {
  name?: string;
  color?: string;
  position?: number;
}

export class ColumnService {
  private columnRepository: ColumnRepository;
  private boardRepository: BoardRepository;

  constructor() {
    this.columnRepository = new ColumnRepository();
    this.boardRepository = new BoardRepository();
  }

  async getBoardColumns(
    boardId: string,
    userId: string,
  ): Promise<ColumnResponse[]> {
    // Verify user owns the board
    const board = await this.boardRepository.findById(boardId, userId);
    if (!board) {
      throw new Error('Board not found');
    }

    const columns = await this.columnRepository.findByBoardId(boardId);
    return columns.map((column) => this.mapColumnResponse(column));
  }

  async createColumn(
    boardId: string,
    userId: string,
    data: CreateColumnRequest,
  ): Promise<ColumnResponse> {
    // Verify user owns the board
    const board = await this.boardRepository.findById(boardId, userId);
    if (!board) {
      throw new Error('Board not found');
    }

    const column = await this.columnRepository.createWithAutoPosition(
      boardId,
      data.name,
      data.color,
    );

    return this.mapColumnResponse(column);
  }

  async updateColumn(
    columnId: string,
    userId: string,
    data: UpdateColumnRequest,
  ): Promise<ColumnResponse | null> {
    // Verify user owns the board that contains this column
    const hasAccess = await this.columnRepository.verifyBoardOwnership(
      columnId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Column not found or access denied');
    }

    const updates: ColumnUpdateFields = {};
    if (data.name !== undefined) {
      updates.name = data.name;
    }
    if (data.color !== undefined) {
      updates.color = data.color;
    }
    if (data.position !== undefined) {
      updates.position = data.position;
    }

    const column = await this.columnRepository.update(columnId, updates);
    if (!column) {
      return null;
    }

    return this.mapColumnResponse(column);
  }

  async deleteColumn(columnId: string, userId: string): Promise<boolean> {
    // Verify user owns the board that contains this column
    const hasAccess = await this.columnRepository.verifyBoardOwnership(
      columnId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Column not found or access denied');
    }

    return await this.columnRepository.delete(columnId);
  }

  async reorderColumns(
    boardId: string,
    userId: string,
    data: ReorderRequest,
  ): Promise<void> {
    // Verify user owns the board
    const board = await this.boardRepository.findById(boardId, userId);
    if (!board) {
      throw new Error('Board not found');
    }

    await this.columnRepository.reorderColumns(boardId, data.items);
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
}
