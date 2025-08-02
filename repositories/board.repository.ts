import { query, queryOne } from '@/lib/db';
import { Board } from '@/types/kanban';

export class BoardRepository {
  async findByUserId(userId: string): Promise<Board[]> {
    const sql = `
      SELECT id, user_id, name, is_default, position, created_at, updated_at
      FROM boards 
      WHERE user_id = $1
      ORDER BY position ASC
    `;
    return query<Board>(sql, [userId]);
  }

  async findById(id: string, userId: string): Promise<Board | null> {
    const sql = `
      SELECT id, user_id, name, is_default, position, created_at, updated_at
      FROM boards 
      WHERE id = $1 AND user_id = $2
    `;
    return queryOne<Board>(sql, [id, userId]);
  }

  async create(
    userId: string,
    name: string,
    isDefault: boolean = false,
  ): Promise<Board> {
    const positionSql = `
      SELECT COALESCE(MAX(position), 0) + 1 as next_position
      FROM boards 
      WHERE user_id = $1
    `;
    const positionResult = await queryOne<{ next_position: number }>(
      positionSql,
      [userId],
    );
    const next_position = positionResult?.next_position || 1;

    const sql = `
      INSERT INTO boards (user_id, name, is_default, position)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, name, is_default, position, created_at, updated_at
    `;

    const newBoard = await queryOne<Board>(sql, [
      userId,
      name,
      isDefault,
      next_position,
    ]);

    if (!newBoard) {
      throw new Error('Failed to create board');
    }

    return newBoard;
  }

  async update(
    id: string,
    userId: string,
    updates: {
      name?: string;
      is_default?: boolean;
      position?: number;
    },
  ): Promise<Board | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (updates.is_default !== undefined) {
      fields.push(`is_default = $${paramCount++}`);
      values.push(updates.is_default);
    }

    if (updates.position !== undefined) {
      fields.push(`position = $${paramCount++}`);
      values.push(updates.position);
    }

    if (fields.length === 0) {
      return this.findById(id, userId);
    }

    values.push(id, userId);

    const sql = `
      UPDATE boards 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount++} AND user_id = $${paramCount++}
      RETURNING id, user_id, name, is_default, position, created_at, updated_at
    `;

    return queryOne<Board>(sql, values);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const sql = `
      DELETE FROM boards 
      WHERE id = $1 AND user_id = $2
    `;
    const result = await query(sql, [id, userId]);
    return result.length > 0;
  }

  async reorderBoards(
    userId: string,
    items: { id: string; position: number }[],
  ): Promise<void> {
    for (const item of items) {
      await query(
        'UPDATE boards SET position = $1 WHERE id = $2 AND user_id = $3',
        [item.position, item.id, userId],
      );
    }
  }

  async setDefault(id: string, userId: string): Promise<void> {
    await query('UPDATE boards SET is_default = false WHERE user_id = $1', [
      userId,
    ]);

    await query(
      'UPDATE boards SET is_default = true WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
  }
}
