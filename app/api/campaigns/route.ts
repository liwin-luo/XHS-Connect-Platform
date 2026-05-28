import { NextRequest } from 'next/server';
import { db, schema } from '@/db';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/campaigns — list all campaigns
export async function GET(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);
    const items = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.userId, userId))
      .orderBy(desc(schema.campaigns.createdAt));
    return Response.json({ ok: true, data: items });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ ok: false, error: err.message }, { status: 401 });
    console.error('Campaigns GET error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/campaigns — create campaign
export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);
    const body = await request.json();
    const id = body.id || `camp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    await db.insert(schema.campaigns).values({
      id,
      userId,
      name: body.name || '',
      brandName: body.brandName || body.brand_name || '',
      productName: body.productName || body.product_name || '',
      sellingPoints: body.sellingPoints || body.selling_points || '',
      format: body.format || '图文',
      budget: body.budget || '',
      toneStyle: body.toneStyle || body.tone_style || 'friendly',
    });

    return Response.json({ ok: true, data: { id } }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ ok: false, error: err.message }, { status: 401 });
    console.error('Campaigns POST error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/campaigns — update campaign (by id in body)
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);
    const body = await request.json();
    const { id } = body;
    if (!id) return Response.json({ ok: false, error: 'Missing id' }, { status: 400 });

    const existing = await db
      .select()
      .from(schema.campaigns)
      .where(and(eq(schema.campaigns.id, id), eq(schema.campaigns.userId, userId)))
      .limit(1);
    if (existing.length === 0) return Response.json({ ok: false, error: 'Campaign not found' }, { status: 404 });

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name) updateData.name = body.name;
    if (body.brandName) updateData.brandName = body.brandName;
    if (body.productName) updateData.productName = body.productName;
    if (body.sellingPoints !== undefined) updateData.sellingPoints = body.sellingPoints;
    if (body.format) updateData.format = body.format;
    if (body.budget !== undefined) updateData.budget = body.budget;
    if (body.toneStyle) updateData.toneStyle = body.toneStyle;

    await db.update(schema.campaigns).set(updateData).where(eq(schema.campaigns.id, id));
    return Response.json({ ok: true, data: { id } });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ ok: false, error: err.message }, { status: 401 });
    console.error('Campaigns PUT error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/campaigns — delete campaign (by id in query)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return Response.json({ ok: false, error: 'Missing id query param' }, { status: 400 });

    await db.delete(schema.campaigns).where(and(eq(schema.campaigns.id, id), eq(schema.campaigns.userId, userId)));
    return Response.json({ ok: true, data: { id } });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ ok: false, error: err.message }, { status: 401 });
    console.error('Campaigns DELETE error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
