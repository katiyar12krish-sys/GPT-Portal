// Creates or updates the database tables from db/schema.sql.  Run: npm run db:migrate  (safe to run again).
import './env';
import fs from 'node:fs';
import { pool } from '../src/lib/server/db';

async function main() {
  const sql = fs.readFileSync('db/schema.sql', 'utf8');
  await pool().query(sql);
  console.log('✔ Database schema is up to date.');
  await pool().end();
}
main().catch(e => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});
