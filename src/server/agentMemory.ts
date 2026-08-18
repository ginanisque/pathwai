import { createHash } from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;
const EMBEDDING_DIMENSIONS = 768;

export type MemoryKind = 'profile' | 'constraint' | 'preference' | 'conversation' | 'action_plan';

export interface AgentMemory {
  id: string;
  kind: MemoryKind;
  content: string;
  metadata: Record<string, unknown>;
  similarity?: number;
  createdAt: string;
  updatedAt: string;
}

const SENSITIVE_MEMORY_PATTERNS: RegExp[] = [
  /\b(passport|document|visa)\s*(number|no\.?|#)\b/i,
  /\b(ssn|social security|national id|identity number)\b/i,
  /\b(latitude|longitude|coordinates|exact location)\b/i,
  /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i,
  /\b(?:\+?\d[\d\s().-]{7,}\d)\b/,
  /\b(abuse narrative|trafficking details|emergency contact)\b/i
];

export function containsSensitiveMemory(text: string): boolean {
  return SENSITIVE_MEMORY_PATTERNS.some(pattern => pattern.test(text));
}

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('MEMORY_NOT_CONFIGURED');
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: Number(process.env.DATABASE_POOL_SIZE || 4),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 8_000,
      ssl: connectionString.includes('sslmode=disable') ? false : { rejectUnauthorized: true }
    });
  }
  return pool;
}

// Deterministic, privacy-preserving local embedding. It keeps the demo functional without
// sending memories to a second model and exercises CockroachDB vector similarity directly.
export function embedMemoryText(text: string): number[] {
  const vector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
  const tokens = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  for (const token of tokens) {
    const digest = createHash('sha256').update(token).digest();
    for (let offset = 0; offset < digest.length; offset += 4) {
      const index = digest.readUInt16BE(offset) % EMBEDDING_DIMENSIONS;
      vector[index] += digest[offset + 2] % 2 === 0 ? 1 : -1;
    }
  }
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map(value => Number((value / magnitude).toFixed(8)));
}

function vectorLiteral(values: number[]): string {
  return `[${values.join(',')}]`;
}

function toMemory(row: any): AgentMemory {
  return {
    id: row.id,
    kind: row.kind,
    content: row.content,
    metadata: row.metadata || {},
    similarity: row.similarity == null ? undefined : Number(row.similarity),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString()
  };
}

export async function saveMemory(input: {
  userId: string;
  kind: MemoryKind;
  content: string;
  metadata?: Record<string, unknown>;
}): Promise<AgentMemory> {
  const content = input.content.trim().slice(0, 4000);
  if (!input.userId || !content) throw new Error('INVALID_MEMORY');
  if (containsSensitiveMemory(content)) throw new Error('SENSITIVE_MEMORY_REJECTED');
  const result = await getPool().query(
    `INSERT INTO pathwai_agent_memories (user_id, kind, content, metadata, embedding)
     VALUES ($1, $2, $3, $4::JSONB, $5::VECTOR)
     RETURNING id, kind, content, metadata, created_at, updated_at`,
    [input.userId, input.kind, content, JSON.stringify(input.metadata || {}), vectorLiteral(embedMemoryText(content))]
  );
  return toMemory(result.rows[0]);
}

export async function recallMemories(userId: string, query: string, limit = 5): Promise<AgentMemory[]> {
  if (!userId || !query.trim()) return [];
  const safeLimit = Math.max(1, Math.min(limit, 10));
  const vector = vectorLiteral(embedMemoryText(query));
  const result = await getPool().query(
    `SELECT id, kind, content, metadata, created_at, updated_at,
            1 / (1 + (embedding <-> $2::VECTOR)) AS similarity
       FROM pathwai_agent_memories
      WHERE user_id = $1
      ORDER BY embedding <-> $2::VECTOR
      LIMIT $3`,
    [userId, vector, safeLimit]
  );
  return result.rows.map(toMemory);
}

export async function listMemories(userId: string, limit = 25): Promise<AgentMemory[]> {
  const result = await getPool().query(
    `SELECT id, kind, content, metadata, created_at, updated_at
       FROM pathwai_agent_memories WHERE user_id = $1
      ORDER BY updated_at DESC LIMIT $2`,
    [userId, Math.max(1, Math.min(limit, 100))]
  );
  return result.rows.map(toMemory);
}

export async function forgetMemory(userId: string, memoryId: string): Promise<boolean> {
  const result = await getPool().query(
    'DELETE FROM pathwai_agent_memories WHERE id = $1 AND user_id = $2',
    [memoryId, userId]
  );
  return (result.rowCount || 0) > 0;
}

export function publicMemoryError(error: unknown): { status: number; body: Record<string, unknown> } {
  const message = error instanceof Error ? error.message : String(error);
  if (message === 'AUTH_REQUIRED' || message === 'AUTH_INVALID_TOKEN') {
    return { status: 401, body: { error: 'authentication_required', message: 'Sign in to use persistent memory.' } };
  }
  if (message === 'AUTH_NOT_CONFIGURED') {
    return { status: 503, body: { error: 'authentication_unavailable', message: 'Authentication is not configured.' } };
  }
  if (message === 'MEMORY_NOT_CONFIGURED') {
    return { status: 503, body: { error: 'memory_unavailable', message: 'CockroachDB memory is not configured.' } };
  }
  if (message === 'INVALID_MEMORY') {
    return { status: 400, body: { error: 'invalid_memory', message: 'A user, kind and non-empty memory are required.' } };
  }
  if (message === 'SENSITIVE_MEMORY_REJECTED') {
    return { status: 422, body: { error: 'sensitive_memory_rejected', message: 'This content may contain sensitive personal or safety data and was not stored.' } };
  }
  console.error('[agent-memory]', error);
  return { status: 500, body: { error: 'memory_error', message: 'The memory operation could not be completed.' } };
}
