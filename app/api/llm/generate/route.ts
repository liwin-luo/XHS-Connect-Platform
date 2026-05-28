import { NextRequest } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { llmService } from '@/lib/llm';

// POST /api/llm/generate — generate outreach messages via LLM
export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);
    const body = await request.json();
    const { campaign, kols } = body;

    if (!campaign || !kols || !Array.isArray(kols) || kols.length === 0) {
      return Response.json({ ok: false, error: 'campaign and kols[] are required' }, { status: 400 });
    }

    const results = [];
    for (const kol of kols) {
      const ctx = {
        brandName: campaign.brandName || '',
        productName: campaign.productName || '',
        sellingPoints: campaign.sellingPoints || '',
        format: campaign.format || '图文',
        budget: campaign.budget || '',
        kolName: kol.name || '',
        kolFollower: kol.followers || 0,
        kolCategory: kol.category || '',
        kolNotes: kol.notes || '',
      };

      const message = await llmService.generateMessage(ctx, campaign.toneStyle || 'friendly');
      results.push({
        id: `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        kolId: kol.id,
        kolName: kol.name,
        message,
        toneStyle: campaign.toneStyle || 'friendly',
        status: 'draft',
      });
    }

    return Response.json({ ok: true, data: results });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ ok: false, error: err.message }, { status: 401 });
    console.error('LLM generate error:', err);
    const msg = err instanceof Error ? err.message : 'LLM generation failed';
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
