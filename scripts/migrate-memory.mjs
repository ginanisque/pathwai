import fs from 'node:fs/promises';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const sql = await fs.readFile(new URL('../db/001_agent_memory.sql', import.meta.url), 'utf8');
const client = new pg.Client({
  connectionString,
  ssl: connectionString.includes('sslmode=disable') ? false : { rejectUnauthorized: true }
});

await client.connect();
try {
  await client.query(sql);
  console.log('CockroachDB agent-memory schema is ready.');
} finally {
  await client.end();
}
