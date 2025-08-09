import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === 'true'
      ? { rejectUnauthorized: false }
      : process.env.DATABASE_SSL === 'require'
        ? { rejectUnauthorized: true }
        : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query<T = unknown>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function queryOne<T = unknown>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

const db = {
  query,
  queryOne,
};

export default db;

export type DbClient = PoolClient;

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore rollback errors
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function queryWithClient<T = unknown>(
  client: PoolClient,
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await client.query(text, params);
  return result.rows as T[];
}

export async function queryOneWithClient<T = unknown>(
  client: PoolClient,
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await queryWithClient<T>(client, text, params);
  return rows[0] || null;
}
