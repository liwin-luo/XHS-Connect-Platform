import { NextRequest } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { llmService } from '@/lib/llm';

// POST /api/llm/analyze-intent — analyze KOL reply intent
export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);
    const body = await request.json();
    const { originalMessage, replyText, kolName } = body;

    if (!originalMessage || !replyText || !kolName) {
      return Response.json({ ok: false, error: 'originalMessage, replyText, and kolName are required' }, { status: 400 });
    }

    const result = await llmService.analyzeIntent(originalMessage, replyText, kolName);
    return Response.json({ ok: true, data: result });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ ok: false, error: err.message }, { status: 401 });
    console.error('LLM analyze-intent error:', err);
    const msg = err instanceof Error ? err.message : 'Intent analysis failed';
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
