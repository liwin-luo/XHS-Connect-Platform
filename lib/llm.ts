import { LLMConfig } from '@/types';

interface OutreachContext {
  brandName: string;
  productName: string;
  sellingPoints: string;
  format: string;
  budget: string;
  kolName: string;
  kolFollower: number;
  kolCategory: string;
  kolNotes?: string;
}

const TONE_LABEL_MAP: Record<string, string> = {
  professional: '专业正式',
  friendly: '轻松友好',
  casual: '热情种草',
  concise: '简洁高效',
};

/**
 * LLM Service — runs server-side only.
 * API keys are read from Vercel environment variables, never from client.
 */
class LLMService {
  private getConfig(): { apiKey: string; baseUrl: string; model: string } {
    const provider = process.env.LLM_PROVIDER || 'deepseek';
    const apiKey = provider === 'deepseek'
      ? process.env.DEEPSEEK_API_KEY
      : process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(`LLM config error: Missing ${provider.toUpperCase()}_API_KEY in environment variables`);
    }

    const baseUrl = provider === 'deepseek'
      ? 'https://api.deepseek.com/v1'
      : 'https://api.openai.com/v1';

    const model = provider === 'deepseek'
      ? (process.env.DEEPSEEK_MODEL || 'deepseek-chat')
      : (process.env.OPENAI_MODEL || 'gpt-4o-mini');

    return { apiKey, baseUrl, model };
  }

  private async callAPI(prompt: string, systemPrompt: string, temperature = 0.8, maxTokens = 300): Promise<string> {
    const { apiKey, baseUrl, model } = this.getConfig();

    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`LLM API call failed (${resp.status}): ${err}`);
    }

    const data = await resp.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  }

  async generateMessage(ctx: OutreachContext, toneStyle: string): Promise<string> {
    const prompt = buildOutreachPrompt(ctx, toneStyle);
    const system = '你是一个专业的小红书品牌商务合作沟通助手。只返回消息正文，不要有额外说明。';
    return this.callAPI(prompt, system, 0.8, 300);
  }

  async generateFollowUp(originalMessage: string, ctx: OutreachContext, daysSince: number): Promise<string> {
    const prompt = buildFollowUpPrompt(originalMessage, ctx, daysSince);
    const system = '你是一个品牌商务助理。只返回跟进消息正文，不要有额外说明。';
    return this.callAPI(prompt, system, 0.7, 200);
  }

  async analyzeIntent(originalMessage: string, replyText: string, kolName: string): Promise<{
    intent: string;
    confidence: number;
    explanation: string;
    suggested_action: string;
  }> {
    const prompt = buildIntentAnalysisPrompt(originalMessage, replyText, kolName);
    const system = '你是一个专业的商务沟通意图分析助手。只输出 JSON，不要多余内容。';

    const text = await this.callAPI(prompt, system, 0.3, 200);

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { intent: 'unknown', confidence: 0, explanation: '解析失败', suggested_action: 'wait' };
    } catch {
      return { intent: 'unknown', confidence: 0, explanation: '解析失败', suggested_action: 'wait' };
    }
  }
}

export const llmService = new LLMService();

// ===== Prompt Builders =====

function buildOutreachPrompt(ctx: OutreachContext, toneStyle: string): string {
  return `你是一个品牌商务的小红书合作沟通助理，负责以品牌方身份给博主写合作邀约私信。

## 品牌信息
- 品牌名称：${ctx.brandName}
- 推广产品：${ctx.productName}
- 核心卖点：${ctx.sellingPoints}
- 期望形式：${ctx.format}
- 预算范围：${ctx.budget}

## 博主信息
- 博主昵称：${ctx.kolName}
- 粉丝量：${ctx.kolFollower}
- 领域：${ctx.kolCategory}
- 备注：${ctx.kolNotes || '无'}

## 沟通风格
请使用「${TONE_LABEL_MAP[toneStyle] || toneStyle}」的语气风格。

## 生成要求
1. 字数控制在 80-150 字，小红书博主每天收到大量私信，必须简短有力
2. 第一句必须个性化引用博主的内容或风格，不能套话
3. 清晰表达合作意图 + 产品核心卖点
4. 结尾有明确的行动召唤（约稿 / 寄样 / 看产品详情）
5. 不要使用过于夸张的营销用语，真诚优先
6. 不要提到价格具体数字，用"有竞争力的合作条件"代替
7. 不要使用模板化称呼如"亲爱的/亲/宝宝"`;
}

function buildFollowUpPrompt(originalMessage: string, ctx: OutreachContext, daysSince: number): string {
  return `你是一个品牌商务助理，需要针对 ${daysSince} 天前已经发出但未回复的合作邀约进行跟进。

## 原始邀约消息
"""
${originalMessage}
"""

## 品牌信息
品牌：${ctx.brandName}
产品：${ctx.productName}

## 要求
1. 这是第 1 次跟进，语气要轻松自然，不能显得催促
2. 提及上次发的消息但没有收到回复
3. 增加一个新的产品亮点（不要重复原始消息里的卖点）
4. 字数 60-100 字
5. 署名：${ctx.brandName} 团队`;
}

function buildIntentAnalysisPrompt(originalMessage: string, replyText: string, kolName: string): string {
  return `分析以下博主回复的合作意愿，只返回 JSON 格式。

## 原始邀约
"""
${originalMessage}
"""

## 博主（${kolName}）回复
"""
${replyText}
"""

## 分析要求
分析博主的回复，返回 JSON：
{
  "intent": "interested | not_interested | need_info | busy | unknown",
  "confidence": 0-1,
  "explanation": "简短的中文解释（15字以内）",
  "suggested_action": "send_detail | wait | archive | follow_up"
}

intent 定义：
- interested: 明确表示感兴趣、要了解详情
- not_interested: 明确拒绝、不接推广
- need_info: 询问价格、要求详情、要看产品
- busy: 说忙、稍后回复、最近没空
- unknown: 无法判断

suggested_action 对应：
- interested → send_detail：发详细合作方案
- need_info → send_detail：发详细合作方案
- busy → follow_up：过几天再跟进
- not_interested → archive：归档不联系
- unknown → wait：暂不处理`;
}
