import { db } from './connection.js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const MIGRATIONS_DIR = join(process.cwd(), 'apps', 'api', 'src', 'db', 'migrations');

async function migrate() {
  // Create migrations tracking table
  await db.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Get applied migrations
  const { rows: applied } = await db.query('SELECT name FROM _migrations ORDER BY id');
  const appliedNames = new Set(applied.map((r: { name: string }) => r.name));

  // Get migration files
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    if (appliedNames.has(file)) continue;

    console.log(`[migrate] Applying: ${file}`);
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');

    await db.query('BEGIN');
    try {
      await db.query(sql);
      await db.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      await db.query('COMMIT');
      console.log(`[migrate] Applied: ${file}`);
    } catch (err) {
      await db.query('ROLLBACK');
      console.error(`[migrate] Failed: ${file}`, err);
      process.exit(1);
    }
  }

  console.log('[migrate] All migrations applied.');
  await db.pool.end();
}

migrate();
