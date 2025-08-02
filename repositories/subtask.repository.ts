import { query, queryOne } from '@/lib/db';
import { Subtask, TaskStatus } from '@/types/kanban';

export class SubtaskRepository {
  async findByTaskId(taskId: string): Promise<Subtask[]> {
    const sql = `
      SELECT id, task_id, title, status, position, created_at, updated_at
      FROM subtasks 
      WHERE task_id = $1
      ORDER BY position ASC
    `;
    return query<Subtask>(sql, [taskId]);
  }

  async findById(id: string): Promise<Subtask | null> {
    const sql = `
      SELECT id, task_id, title, status, position, created_at, updated_at
      FROM subtasks 
      WHERE id = $1
    `;
    return queryOne<Subtask>(sql, [id]);
  }

  async create(
    taskId: string,
    title: string,
    status: TaskStatus = 'todo',
  ): Promise<Subtask> {
    // Get the next position within the task
    const positionSql = `
      SELECT COALESCE(MAX(position), 0) + 1 as next_position
      FROM subtasks 
      WHERE task_id = $1
    `;
    const positionResult = await queryOne<{ next_position: number }>(
      positionSql,
      [taskId],
    );
    const next_position = positionResult?.next_position || 1;

    const sql = `
      INSERT INTO subtasks (task_id, title, status, position)
      VALUES ($1, $2, $3, $4)
      RETURNING id, task_id, title, status, position, created_at, updated_at
    `;

    const newSubtask = await queryOne<Subtask>(sql, [
      taskId,
      title,
      status,
      next_position,
    ]);

    if (!newSubtask) {
      throw new Error('Failed to create subtask');
    }

    return newSubtask;
  }

  async update(
    id: string,
    updates: {
      title?: string;
      status?: TaskStatus;
      position?: number;
    },
  ): Promise<Subtask | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
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
      UPDATE subtasks 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount++}
      RETURNING id, task_id, title, status, position, created_at, updated_at
    `;

    return queryOne<Subtask>(sql, values);
  }

  async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM subtasks WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.length > 0;
  }

  async reorderSubtasks(
    taskId: string,
    items: { id: string; position: number }[],
  ): Promise<void> {
    for (const item of items) {
      await query(
        'UPDATE subtasks SET position = $1 WHERE id = $2 AND task_id = $3',
        [item.position, item.id, taskId],
      );
    }
  }

  async verifyTaskOwnership(
    subtaskId: string,
    userId: string,
  ): Promise<boolean> {
    const sql = `
      SELECT 1 FROM subtasks s
      JOIN tasks t ON s.task_id = t.id
      JOIN boards b ON t.board_id = b.id
      WHERE s.id = $1 AND b.user_id = $2
    `;
    const result = await queryOne(sql, [subtaskId, userId]);
    return !!result;
  }

  async getTaskIdBySubtaskId(subtaskId: string): Promise<string | null> {
    const sql = `SELECT task_id FROM subtasks WHERE id = $1`;
    const result = await queryOne<{ task_id: string }>(sql, [subtaskId]);
    return result?.task_id || null;
  }
}
