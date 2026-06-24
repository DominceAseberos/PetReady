import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://petready:localdev@localhost:5432/petready',
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

export const db = {
  query: (text: string, params?: unknown[]) => pool.query(text, params),
  pool,
};
