import { NextRequest } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { llmService } from '@/lib/llm';

// POST /api/llm/follow-up — generate follow-up message
export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);
    const body = await request.json();
    const { originalMessage, campaign, daysSince } = body;

    if (!originalMessage || !campaign) {
      return Response.json({ ok: false, error: 'originalMessage and campaign are required' }, { status: 400 });
    }

    const ctx = {
      brandName: campaign.brandName || '',
      productName: campaign.productName || '',
      sellingPoints: campaign.sellingPoints || '',
      format: campaign.format || '图文',
      budget: campaign.budget || '',
      kolName: campaign.kolName || '',
      kolFollower: 0,
      kolCategory: '',
    };

    const followUpMessage = await llmService.generateFollowUp(originalMessage, ctx, daysSince || 7);
    return Response.json({ ok: true, data: { message: followUpMessage } });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ ok: false, error: err.message }, { status: 401 });
    console.error('LLM follow-up error:', err);
    const msg = err instanceof Error ? err.message : 'Follow-up generation failed';
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
