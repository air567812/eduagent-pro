import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { checkAndIncrementRateLimit } from '@/lib/rate-limit';
import { executeEducationalAI, AIProvider } from '@/services/aiService';
import { getToolConfig } from '@/lib/tools-config';
import prisma from '@/lib/prisma';
import { ToolType, Tier } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const userTier: Tier = user?.tier || 'BASIC';

    const body = await req.json();
    const { toolKey, sourceText, parameters, targetModel, sessionId, apiKey: bodyApiKey, provider } = body;

    const headerApiKey = req.headers.get('x-openai-api-key') || req.headers.get('x-ai-api-key') || '';
    const customApiKey = (bodyApiKey || headerApiKey || process.env.OPENAI_API_KEY || '').trim();

    if (!toolKey) {
      return NextResponse.json({ error: 'Tool key is required.' }, { status: 400 });
    }

    const toolConfig = getToolConfig(toolKey);
    if (!toolConfig) {
      return NextResponse.json({ error: `Unknown tool key: ${toolKey}` }, { status: 400 });
    }

    // Rate Limiting check (Bypass for SUPER_ADMIN or EDUCATOR)
    const isEducatorOrAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'INSTITUTION_ADMIN' || userTier === 'EDUCATOR';
    if (!isEducatorOrAdmin) {
      const userIdToCheck = user?.id || 'usr_anonymous_student';
      const rateCheck = await checkAndIncrementRateLimit(userIdToCheck, userTier);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          {
            error: `Daily rate limit reached (${rateCheck.maxLimit} requests/day on your ${userTier} tier). Upgrade your plan or try again tomorrow.`,
            code: 'RATE_LIMIT_EXCEEDED'
          },
          { status: 429 }
        );
      }
    }

    // Run Free Multi-Provider AI Engine
    const agentResult = await executeEducationalAI({
      toolKey: toolKey as ToolType,
      sourceText: sourceText || 'Standard lecture notes and exam curriculum content.',
      parameters: parameters || {},
      provider: (provider as AIProvider) || 'POLLINATIONS_FREE',
      apiKey: customApiKey,
      model: targetModel
    });

    let generationId = `gen_${Date.now()}`;
    try {
      if (user?.id) {
        const dbUser = await prisma.user.findFirst({
          where: { OR: [{ id: user.id }, { email: user.email }] }
        });
        if (dbUser) {
          const record = await prisma.aIGeneration.create({
            data: {
              id: generationId,
              userId: dbUser.id,
              sessionId: sessionId || null,
              toolType: toolKey,
              parameters: JSON.stringify(parameters || {}),
              prompt: sourceText?.slice(0, 500) || '',
              resultData: JSON.stringify(agentResult.data),
              tokensUsed: agentResult.tokensUsed,
              modelName: `${agentResult.providerUsed} - ${agentResult.modelUsed}`,
              durationMs: agentResult.durationMs
            }
          });
          generationId = record.id;
        }
      }
    } catch (dbErr) {
      console.warn('Generation DB log deferred:', dbErr);
    }

    return NextResponse.json({
      success: true,
      result: {
        id: generationId,
        toolKey,
        data: agentResult.data,
        tokensUsed: agentResult.tokensUsed,
        modelUsed: `${agentResult.providerUsed} - ${agentResult.modelUsed}`,
        durationMs: agentResult.durationMs,
        isLiveOpenAI: !agentResult.isFallback,
        quotaWarning: agentResult.quotaWarning
      }
    });
  } catch (error: any) {
    console.error('API /api/ai/generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed.', code: 'AI_AGENT_ERROR' },
      { status: 500 }
    );
  }
}
