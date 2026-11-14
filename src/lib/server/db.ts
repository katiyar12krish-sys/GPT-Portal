import { Pool, type PoolClient, type QueryResultRow } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set. See DEPLOY.md.');
  const local = /localhost|127\.0\.0\.1/.test(url);
  return new Pool({
    connectionString: url,
    max: 5,
    idleTimeoutMillis: 30_000,
    ssl: local || process.env.DATABASE_SSL === 'false' ? undefined : { rejectUnauthorized: false },
  });
}

export function pool(): Pool {
  if (!globalThis.__pgPool) globalThis.__pgPool = createPool();
  return globalThis.__pgPool;
}

export async function query<T extends QueryResultRow = any>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool().query<T>(text, params as any[]);
  return res.rows;
}

export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query('BEGIN');
    const out = await fn(client);
    await client.query('COMMIT');
    return out;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
