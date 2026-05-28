import { NextRequest } from 'next/server';
import { db, schema } from '@/db';
import { generateApiKey, AuthError } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// POST /api/auth/register — create a new user + generate API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ ok: false, error: 'Valid email is required' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email)).limit(1);
    if (existing.length > 0) {
      return Response.json({ ok: false, error: 'Email already registered' }, { status: 409 });
    }

    const apiKey = generateApiKey();
    const id = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    await db.insert(schema.users).values({ id, email, apiKey });

    // Create default settings for the new user
    await db.insert(schema.settings).values({
      id: `s_${Date.now().toString(36)}`,
      userId: id,
      autoScore: true,
      scoreWeights: { engagement: 0.4, popularity: 0.3, activity: 0.3 },
      theme: 'dark',
    });

    return Response.json({
      ok: true,
      data: { id, email, apiKey, message: 'Save this API key — it will not be shown again' },
    }, { status: 201 });
  } catch (err) {
    console.error('Auth register error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/auth/login — validate API key and return user info
export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return Response.json({ ok: false, error: 'Missing Authorization header' }, { status: 401 });
    }

    const apiKey = auth.slice(7).trim();
    const [user] = await db
      .select({ id: schema.users.id, email: schema.users.email, brandName: schema.users.brandName })
      .from(schema.users)
      .where(eq(schema.users.apiKey, apiKey))
      .limit(1);

    if (!user) {
      return Response.json({ ok: false, error: 'Invalid API key' }, { status: 401 });
    }

    return Response.json({ ok: true, data: user });
  } catch (err) {
    console.error('Auth login error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
