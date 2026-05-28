import { NextRequest } from 'next/server';
import { db, schema } from '@/db';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// GET /api/settings — get user settings
export async function GET(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);
    const [setting] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.userId, userId))
      .limit(1);

    const [user] = await db
      .select({ brandName: schema.users.brandName, brandCategory: schema.users.brandCategory, brandWebsite: schema.users.brandWebsite, brandDesc: schema.users.brandDesc })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    return Response.json({
      ok: true,
      data: {
        brand: user ? {
          name: user.brandName || '',
          category: user.brandCategory || '',
          website: user.brandWebsite || '',
          description: user.brandDesc || '',
        } : null,
        theme: setting?.theme || 'dark',
        auto_score: setting?.autoScore ?? true,
        score_weights: setting?.scoreWeights || { engagement: 0.4, popularity: 0.3, activity: 0.3 },
      },
    });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ ok: false, error: err.message }, { status: 401 });
    console.error('Settings GET error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/settings — update settings
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);
    const body = await request.json();

    // Update brand info on users table
    if (body.brand) {
      const brandUpdate: Record<string, unknown> = { updatedAt: new Date() };
      if (body.brand.name !== undefined) brandUpdate.brandName = body.brand.name;
      if (body.brand.category !== undefined) brandUpdate.brandCategory = body.brand.category;
      if (body.brand.website !== undefined) brandUpdate.brandWebsite = body.brand.website;
      if (body.brand.description !== undefined) brandUpdate.brandDesc = body.brand.description;
      await db.update(schema.users).set(brandUpdate).where(eq(schema.users.id, userId));
    }

    // Update plugin settings on settings table
    const settingUpdate: Record<string, unknown> = { updatedAt: new Date() };
    if (body.theme !== undefined) settingUpdate.theme = body.theme;
    if (body.auto_score !== undefined) settingUpdate.autoScore = body.auto_score;
    if (body.score_weights !== undefined) settingUpdate.scoreWeights = body.score_weights;

    const existing = await db.select().from(schema.settings).where(eq(schema.settings.userId, userId)).limit(1);
    if (existing.length > 0) {
      await db.update(schema.settings).set(settingUpdate).where(eq(schema.settings.userId, userId));
    } else {
      await db.insert(schema.settings).values({
        id: `s_${Date.now().toString(36)}`,
        userId,
        ...(settingUpdate as any),
      });
    }

    return Response.json({ ok: true, data: { userId } });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ ok: false, error: err.message }, { status: 401 });
    console.error('Settings PUT error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
