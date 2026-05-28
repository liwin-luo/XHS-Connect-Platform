import { NextRequest } from 'next/server';
import { db, schema } from '@/db';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

// PUT /api/wishlist/[id] — update item
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
      .from(schema.wishlistItems)
      .where(and(eq(schema.wishlistItems.id, id), eq(schema.wishlistItems.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return Response.json({ ok: false, error: 'Item not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.estimated_budget !== undefined) updateData.estimatedBudget = body.estimated_budget;
    if (body.tags) updateData.tags = body.tags;
    if (body.contact_history) updateData.contactHistory = body.contact_history;
    if (body.last_contacted) updateData.lastContacted = new Date(body.last_contacted);
    if (body.score !== undefined) updateData.score = body.score;
    if (body.score_breakdown) updateData.scoreBreakdown = body.score_breakdown;
    if (body.kol) {
      if (body.kol.notes !== undefined) updateData.notes = body.kol.notes;
    }

    await db.update(schema.wishlistItems)
      .set(updateData)
      .where(and(eq(schema.wishlistItems.id, id), eq(schema.wishlistItems.userId, userId)));

    return Response.json({ ok: true, data: { id } });
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json({ ok: false, error: err.message }, { status: 401 });
    }
    console.error('Wishlist PUT error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/wishlist/[id] — remove item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await authenticateRequest(request);
    const { id } = await params;

    await db.delete(schema.wishlistItems)
      .where(and(eq(schema.wishlistItems.id, id), eq(schema.wishlistItems.userId, userId)));

    return Response.json({ ok: true, data: { id } });
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json({ ok: false, error: err.message }, { status: 401 });
    }
    console.error('Wishlist DELETE error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
