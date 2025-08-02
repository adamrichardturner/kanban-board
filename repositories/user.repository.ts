import { query, queryOne } from '@/lib/db';
import { User } from '@/types';

export class UserRepository {
  async findDemoUser(): Promise<User | null> {
    const sql = `
      SELECT id, email, username, full_name, is_demo, created_at
      FROM users 
      WHERE is_demo = true
      LIMIT 1
    `;
    return queryOne<User>(sql);
  }

  async findUserById(userId: string): Promise<User | null> {
    const sql = `
      SELECT id, email, username, full_name, is_demo, created_at
      FROM users 
      WHERE id = $1
    `;
    return queryOne<User>(sql, [userId]);
  }

  async createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    const sql = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `;
    await query(sql, [userId, token, expiresAt]);
  }

  async deleteRefreshToken(token: string): Promise<void> {
    const sql = 'DELETE FROM refresh_tokens WHERE token = $1';
    await query(sql, [token]);
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    const sql = 'DELETE FROM refresh_tokens WHERE user_id = $1';
    await query(sql, [userId]);
  }
}
