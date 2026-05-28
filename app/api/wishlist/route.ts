import { NextRequest } from 'next/server';
import { db, schema } from '@/db';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/wishlist — list all wishlist items
export async function GET(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);
    const items = await db
      .select()
      .from(schema.wishlistItems)
      .where(eq(schema.wishlistItems.userId, userId))
      .orderBy(desc(schema.wishlistItems.createdAt));

    return Response.json({ ok: true, data: items });
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json({ ok: false, error: err.message }, { status: 401 });
    }
    console.error('Wishlist GET error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/wishlist — add item
export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);
    const body = await request.json();

    const id = body.id || `wl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    await db.insert(schema.wishlistItems).values({
      id,
      userId,
      kolId: body.kol?.id || body.kolId || '',
      kolName: body.kol?.name || body.kolName || '',
      kolAvatar: body.kol?.avatar || '',
      kolDesc: body.kol?.desc || '',
      kolUrl: body.kol?.url || '',
      followers: body.kol?.followers || 0,
      following: body.kol?.following || 0,
      notesCount: body.kol?.notes_count || 0,
      avgLikes: body.kol?.avg_likes || 0,
      avgCollects: body.kol?.avg_collects || 0,
      avgComments: body.kol?.avg_comments || 0,
      engagementRate: body.kol?.engagement_rate || 0,
      category: body.kol?.category || '',
      score: body.kol?.score || 0,
      scoreBreakdown: body.kol?.score_breakdown || { engagement: 0, popularity: 0, activity: 0 },
      recentNotes: body.kol?.recent_notes || [],
      tags: body.kol?.tags || [],
      notes: body.notes || '',
      status: body.status || 'pending',
      estimatedBudget: body.estimated_budget || 0,
      contactHistory: body.contact_history || [],
    });

    return Response.json({ ok: true, data: { id } }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json({ ok: false, error: err.message }, { status: 401 });
    }
    console.error('Wishlist POST error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
