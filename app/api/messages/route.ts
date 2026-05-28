import { NextRequest } from 'next/server';
import { db, schema } from '@/db';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/messages — list messages (optional ?campaign_id=)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);
    const campaignId = request.nextUrl.searchParams.get('campaign_id');

    let items;
    if (campaignId) {
      items = await db
        .select()
        .from(schema.messages)
        .where(and(eq(schema.messages.userId, userId), eq(schema.messages.campaignId, campaignId)))
        .orderBy(desc(schema.messages.createdAt));
    } else {
      items = await db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.userId, userId))
        .orderBy(desc(schema.messages.createdAt));
    }

    return Response.json({ ok: true, data: items });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ ok: false, error: err.message }, { status: 401 });
    console.error('Messages GET error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/messages — create message(s)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);
    const body = await request.json();
    const items = Array.isArray(body) ? body : [body];

    const results = [];
    for (const item of items) {
      const id = item.id || `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      await db.insert(schema.messages).values({
        id,
        userId,
        campaignId: item.campaignId || item.campaign_id || null,
        kolId: item.kolId || item.kol_id || '',
        kolName: item.kolName || item.kol_name || '',
        message: item.message || '',
        toneStyle: item.toneStyle || item.tone_style || 'friendly',
        status: item.status || 'draft',
      });
      results.push({ id });
    }

    return Response.json({ ok: true, data: results }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ ok: false, error: err.message }, { status: 401 });
    console.error('Messages POST error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
