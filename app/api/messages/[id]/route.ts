import { NextRequest } from 'next/server';
import { db, schema } from '@/db';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

// PUT /api/messages/[id] — update a message (status, reply, follow-up)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await authenticateRequest(request);
    const { id } = await params;
    const body = await request.json();

    const existing = await db
      .select()
      .from(schema.messages)
      .where(and(eq(schema.messages.id, id), eq(schema.messages.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return Response.json({ ok: false, error: 'Message not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.status) updateData.status = body.status;
    if (body.message !== undefined) updateData.message = body.message;
    if (body.replyText !== undefined) updateData.replyText = body.replyText;
    if (body.replyAt) updateData.replyAt = new Date(body.replyAt);
    if (body.aiIntent !== undefined) updateData.aiIntent = body.aiIntent;
    if (body.sentAt) updateData.sentAt = new Date(body.sentAt);
    if (body.followUpMessage !== undefined) updateData.followUpMessage = body.followUpMessage;
    if (body.followUpAt) updateData.followUpAt = new Date(body.followUpAt);

    await db.update(schema.messages)
      .set(updateData)
      .where(and(eq(schema.messages.id, id), eq(schema.messages.userId, userId)));

    return Response.json({ ok: true, data: { id } });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ ok: false, error: err.message }, { status: 401 });
    console.error('Messages PUT error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/messages/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await authenticateRequest(request);
    const { id } = await params;

    await db.delete(schema.messages)
      .where(and(eq(schema.messages.id, id), eq(schema.messages.userId, userId)));

    return Response.json({ ok: true, data: { id } });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ ok: false, error: err.message }, { status: 401 });
    console.error('Messages DELETE error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
