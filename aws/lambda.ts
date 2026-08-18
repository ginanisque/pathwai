import { GoogleGenAI } from '@google/genai';
import { listMemories, recallMemories, saveMemory, forgetMemory, publicMemoryError } from '../src/server/agentMemory';
import { verifyFirebaseUser } from '../src/server/firebaseAuth';

interface ApiEvent {
  rawPath?: string;
  requestContext?: { http?: { method?: string } };
  headers?: Record<string, string | undefined>;
  body?: string | null;
}

const response = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: {
    'content-type': 'application/json',
    'access-control-allow-origin': process.env.ALLOWED_ORIGIN || '*',
    'access-control-allow-headers': 'authorization,content-type',
    'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS'
  },
  body: JSON.stringify(body)
});

export async function handler(event: ApiEvent) {
  const method = event.requestContext?.http?.method || 'GET';
  if (method === 'OPTIONS') return response(204, {});
  const path = event.rawPath || '/';
  if (path.endsWith('/api/health')) {
    return response(200, { status: 'ok', service: 'pathwai-memory', region: process.env.AWS_REGION || 'unknown' });
  }
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    const userId = await verifyFirebaseUser(event.headers || {});
    if (path.endsWith('/api/memory') && method === 'GET') {
      return response(200, { memories: await listMemories(userId) });
    }
    if (path.endsWith('/api/memory') && method === 'POST') {
      return response(201, { memory: await saveMemory({ userId, kind: body.kind, content: body.content, metadata: body.metadata }) });
    }
    if (path.includes('/api/memory/') && method === 'DELETE') {
      return response(200, { deleted: await forgetMemory(userId, path.split('/').pop() || '') });
    }
    if (path.endsWith('/api/agent/chat') && method === 'POST') {
      const prompt = String(body.prompt || '').trim();
      if (!prompt) return response(400, { error: 'prompt_required' });
      if (prompt.length > 4000) return response(400, { error: 'prompt_too_long' });
      const memories = await recallMemories(userId, prompt, 5);
      await saveMemory({ userId, kind: 'conversation', content: `Traveller asked: ${prompt}`, metadata: { source: 'aws-lambda' } });
      const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
      const memoryContext = memories.map((m, index) => `${index + 1}. [${m.kind}] ${m.content}`).join('\n');
      let reply = `I recalled ${memories.length} relevant memories. ${memoryContext || 'No prior context was found.'}`;
      if (ai) {
        const result = await ai.models.generateContent({
          model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
          contents: `You are PathWai, a calm travel assistant. Use only relevant memory, label uncertainty, and never claim legal authority.\nMemories:\n${memoryContext || 'None'}\nCurrent profile: ${JSON.stringify(body.profile || {})}\nQuestion: ${prompt}`
        });
        reply = result.text || reply;
      }
      await saveMemory({ userId, kind: 'action_plan', content: reply.slice(0, 4000), metadata: { source: 'aws-lambda', basedOn: memories.map(m => m.id) } });
      return response(200, { reply, memoriesUsed: memories, responseMode: ai ? 'live_ai' : 'memory_only' });
    }
    return response(404, { error: 'not_found' });
  } catch (error) {
    if (error instanceof Error && (error.message === 'AUTH_REQUIRED' || error.message === 'AUTH_INVALID_TOKEN')) {
      return response(401, { error: 'authentication_required', message: 'Sign in to use persistent memory.' });
    }
    const safe = publicMemoryError(error);
    return response(safe.status, safe.body);
  }
}
