import { query, queryOne } from '@/lib/db';
import { Task, TaskStatus } from '@/types/kanban';

export class TaskRepository {
  async findByBoardId(boardId: string): Promise<Task[]> {
    const sql = `
      SELECT id, board_id, column_id, title, description, status, position, created_at, updated_at
      FROM tasks 
      WHERE board_id = $1
      ORDER BY position ASC
    `;
    return query<Task>(sql, [boardId]);
  }

  async findByColumnId(columnId: string): Promise<Task[]> {
    const sql = `
      SELECT id, board_id, column_id, title, description, status, position, created_at, updated_at
      FROM tasks 
      WHERE column_id = $1
      ORDER BY position ASC
    `;
    return query<Task>(sql, [columnId]);
  }

  async findById(id: string): Promise<Task | null> {
    const sql = `
      SELECT id, board_id, column_id, title, description, status, position, created_at, updated_at
      FROM tasks 
      WHERE id = $1
    `;
    return queryOne<Task>(sql, [id]);
  }

  async create(
    boardId: string,
    columnId: string,
    title: string,
    description?: string,
    status: TaskStatus = 'todo',
  ): Promise<Task> {
    // Get the next position within the column
    const positionSql = `
      SELECT COALESCE(MAX(position), 0) + 1 as next_position
      FROM tasks 
      WHERE column_id = $1
    `;
    const positionResult = await queryOne<{ next_position: number }>(
      positionSql,
      [columnId],
    );
    const next_position = positionResult?.next_position || 1;

    const sql = `
      INSERT INTO tasks (board_id, column_id, title, description, status, position)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, board_id, column_id, title, description, status, position, created_at, updated_at
    `;

    const newTask = await queryOne<Task>(sql, [
      boardId,
      columnId,
      title,
      description || null,
      status,
      next_position,
    ]);

    if (!newTask) {
      throw new Error('Failed to create task');
    }

    return newTask;
  }

  async update(
    id: string,
    updates: {
      column_id?: string;
      title?: string;
      description?: string;
      status?: TaskStatus;
      position?: number;
    },
  ): Promise<Task | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.column_id !== undefined) {
      fields.push(`column_id = $${paramCount++}`);
      values.push(updates.column_id);
    }

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }

    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }

    if (updates.position !== undefined) {
      fields.push(`position = $${paramCount++}`);
      values.push(updates.position);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `
      UPDATE tasks 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount++}
      RETURNING id, board_id, column_id, title, description, status, position, created_at, updated_at
    `;

    return queryOne<Task>(sql, values);
  }

  async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM tasks WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.length > 0;
  }

  async moveToColumn(
    id: string,
    newColumnId: string,
    newPosition: number,
  ): Promise<Task | null> {
    // First, update positions of tasks in the destination column
    await query(
      'UPDATE tasks SET position = position + 1 WHERE column_id = $1 AND position >= $2',
      [newColumnId, newPosition],
    );

    // Then move the task
    const sql = `
      UPDATE tasks 
      SET column_id = $1, position = $2
      WHERE id = $3
      RETURNING id, board_id, column_id, title, description, status, position, created_at, updated_at
    `;

    return queryOne<Task>(sql, [newColumnId, newPosition, id]);
  }

  async reorderTasks(
    columnId: string,
    items: { id: string; position: number }[],
  ): Promise<void> {
    for (const item of items) {
      await query(
        'UPDATE tasks SET position = $1 WHERE id = $2 AND column_id = $3',
        [item.position, item.id, columnId],
      );
    }
  }

  async verifyBoardOwnership(taskId: string, userId: string): Promise<boolean> {
    const sql = `
      SELECT 1 FROM tasks t
      JOIN boards b ON t.board_id = b.id
      WHERE t.id = $1 AND b.user_id = $2
    `;
    const result = await queryOne(sql, [taskId, userId]);
    return !!result;
  }

  async getBoardIdByTaskId(taskId: string): Promise<string | null> {
    const sql = `SELECT board_id FROM tasks WHERE id = $1`;
    const result = await queryOne<{ board_id: string }>(sql, [taskId]);
    return result?.board_id || null;
  }
}
