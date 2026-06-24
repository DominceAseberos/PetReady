import { db } from './connection.js';

async function rollback() {
  const { rows } = await db.query('SELECT name FROM _migrations ORDER BY id DESC LIMIT 1');
  if (rows.length === 0) {
    console.log('[rollback] No migrations to rollback.');
    await db.pool.end();
    return;
  }

  const last = rows[0].name;
  console.log(`[rollback] Removing last migration: ${last}`);
  await db.query('DELETE FROM _migrations WHERE name = $1', [last]);
  console.log('[rollback] Done. Run migration-specific rollback SQL manually if needed.');
  await db.pool.end();
}

rollback();
