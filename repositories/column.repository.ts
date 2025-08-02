import { query, queryOne } from '@/lib/db';
import { Column } from '@/types/kanban';

export class ColumnRepository {
  async findByBoardId(boardId: string): Promise<Column[]> {
    const sql = `
      SELECT id, board_id, name, position, color, created_at, updated_at
      FROM columns 
      WHERE board_id = $1
      ORDER BY position ASC
    `;
    return query<Column>(sql, [boardId]);
  }

  async findById(id: string): Promise<Column | null> {
    const sql = `
      SELECT id, board_id, name, position, color, created_at, updated_at
      FROM columns 
      WHERE id = $1
    `;
    return queryOne<Column>(sql, [id]);
  }

  async create(
    boardId: string,
    name: string,
    color: string = '#3B82F6',
  ): Promise<Column> {
    // Get the next position
    const positionSql = `
      SELECT COALESCE(MAX(position), 0) + 1 as next_position
      FROM columns 
      WHERE board_id = $1
    `;
    const positionResult = await queryOne<{ next_position: number }>(
      positionSql,
      [boardId],
    );
    const next_position = positionResult?.next_position || 1;

    const sql = `
      INSERT INTO columns (board_id, name, position, color)
      VALUES ($1, $2, $3, $4)
      RETURNING id, board_id, name, position, color, created_at, updated_at
    `;

    const newColumn = await queryOne<Column>(sql, [
      boardId,
      name,
      next_position,
      color,
    ]);

    if (!newColumn) {
      throw new Error('Failed to create column');
    }

    return newColumn;
  }

  async update(
    id: string,
    updates: {
      name?: string;
      color?: string;
      position?: number;
    },
  ): Promise<Column | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (updates.color !== undefined) {
      fields.push(`color = $${paramCount++}`);
      values.push(updates.color);
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
      UPDATE columns 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount++}
      RETURNING id, board_id, name, position, color, created_at, updated_at
    `;

    return queryOne<Column>(sql, values);
  }

  async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM columns WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.length > 0;
  }

  async reorderColumns(
    boardId: string,
    items: { id: string; position: number }[],
  ): Promise<void> {
    for (const item of items) {
      await query(
        'UPDATE columns SET position = $1 WHERE id = $2 AND board_id = $3',
        [item.position, item.id, boardId],
      );
    }
  }

  async verifyBoardOwnership(
    columnId: string,
    userId: string,
  ): Promise<boolean> {
    const sql = `
      SELECT 1 FROM columns c
      JOIN boards b ON c.board_id = b.id
      WHERE c.id = $1 AND b.user_id = $2
    `;
    const result = await queryOne(sql, [columnId, userId]);
    return !!result;
  }
}
