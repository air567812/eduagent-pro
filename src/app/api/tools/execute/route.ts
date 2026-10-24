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

    const body = await req.json().catch(() => ({}));
    const toolKey = (body.toolKey || body.tool || body.toolType) as ToolType;
    const sourceText = body.sourceText || body.text || body.curriculumText || '';
    const parameters = body.parameters || body.params || {};
    const targetModel = body.targetModel || body.model;
    const sessionId = body.sessionId;
    const imageUrls = body.imageUrls || body.images || [];
    const provider = body.provider as AIProvider;

    const headerApiKey = req.headers.get('x-openai-api-key') || req.headers.get('x-ai-api-key') || '';
    const customApiKey = (body.apiKey || headerApiKey || process.env.OPENAI_API_KEY || '').trim();

    if (!toolKey) {
      return NextResponse.json(
        { error: 'Missing toolKey in request body.' },
        { status: 400 }
      );
    }

    const toolConfig = getToolConfig(toolKey);
    if (!toolConfig) {
      return NextResponse.json(
        { error: `Unrecognized tool key: ${toolKey}` },
        { status: 400 }
      );
    }

    const isEducatorOrAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'INSTITUTION_ADMIN' || user?.tier === 'EDUCATOR';
    if (!isEducatorOrAdmin) {
      const userIdToCheck = user?.id || 'usr_anonymous_student';
      const rateCheck = await checkAndIncrementRateLimit(userIdToCheck, userTier);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          {
            error: `Daily rate limit reached (${rateCheck.maxLimit} requests/day on your ${userTier} plan). Upgrade to Educator for unlimited access.`,
            code: 'RATE_LIMIT_EXCEEDED'
          },
          { status: 429 }
        );
      }
    }

    // Run Free Multi-Provider AI Engine
    const agentResult = await executeEducationalAI({
      toolKey,
      sourceText: sourceText || 'Standard comprehensive lecture notes and exam curriculum content.',
      imageUrls,
      parameters,
      provider: provider || 'POLLINATIONS_FREE',
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
              parameters: JSON.stringify(parameters),
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
      console.warn('Execution audit DB note:', dbErr);
    }

    return NextResponse.json({
      success: true,
      id: generationId,
      toolType: toolKey,
      toolTitle: toolConfig.title,
      data: agentResult.data,
      tokensUsed: agentResult.tokensUsed,
      modelUsed: `${agentResult.providerUsed} - ${agentResult.modelUsed}`,
      durationMs: agentResult.durationMs,
      isLiveOpenAI: !agentResult.isFallback,
      quotaWarning: agentResult.quotaWarning
    });
  } catch (error: any) {
    console.error('Tool execution API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to process educational tool execution.',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: '/api/tools/execute',
    engine: 'Zero-Cost Free AI Pipeline (Pollinations + Gemini + Groq)',
    supportedToolsCount: 15
  });
}
