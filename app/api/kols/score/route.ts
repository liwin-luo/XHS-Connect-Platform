import { NextRequest } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';

interface KOLScoreParams {
  followers: number;
  avg_likes: number;
  avg_collects: number;
  avg_comments: number;
  engagement_rate: number;
  notes_count: number;
}

// POST /api/kols/score — batch score KOLs
export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);
    const body = await request.json();
    const kols: KOLScoreParams[] = body.kols || body;

    if (!Array.isArray(kols) || kols.length === 0) {
      return Response.json({ ok: false, error: 'kols[] is required' }, { status: 400 });
    }

    const results = kols.map(kol => {
      const score = calculateScore(kol);
      return { ...score };
    });

    return Response.json({ ok: true, data: results });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ ok: false, error: err.message }, { status: 401 });
    console.error('KOL score error:', err);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Score calculation:
 * - Engagement: avg_likes/notes_count weighting, engagement_rate bonus
 * - Popularity: followers, avg reach
 * - Activity: notes_count, consistency
 * Returns score 0-100
 */
function calculateScore(kol: KOLScoreParams) {
  const { followers, avg_likes, avg_collects, avg_comments, engagement_rate, notes_count } = kol;

  // Engagement score (0-100): based on likes per note + engagement rate bonus
  const likesPerNote = avg_likes > 0 ? Math.min(avg_likes / 100, 100) : 0;
  const engagementBonus = engagement_rate > 0 ? Math.min(engagement_rate * 100, 40) : 0;
  const engagement = Math.min(likesPerNote * 0.6 + engagementBonus * 0.4, 100);

  // Popularity score (0-100): follower-based
  let popularity = 0;
  if (followers > 1000000) popularity = 95 + Math.min((followers - 1000000) / 100000, 5);
  else if (followers > 500000) popularity = 85 + ((followers - 500000) / 500000) * 10;
  else if (followers > 100000) popularity = 65 + ((followers - 100000) / 400000) * 20;
  else if (followers > 50000) popularity = 45 + ((followers - 50000) / 50000) * 20;
  else if (followers > 10000) popularity = 25 + ((followers - 10000) / 40000) * 20;
  else popularity = Math.min(followers / 10000 * 25, 25);

  // Activity score (0-100): notes count based
  const activity = Math.min(notes_count > 50 ? 85 + Math.min((notes_count - 50) / 10, 15) : (notes_count / 50) * 85, 100);

  // Composite (weighted evenly, can be customized by user settings)
  const composite = Math.round(engagement * 0.35 + popularity * 0.35 + activity * 0.3);

  return {
    kolId: (kol as any).id || '',
    score: composite,
    score_breakdown: {
      engagement: Math.round(engagement),
      popularity: Math.round(popularity),
      activity: Math.round(activity),
    },
    engagement_rate,
  };
}
