import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { checkAndIncrementRateLimit } from '@/lib/rate-limit';
import { runEducationalToolAgent } from '@/lib/openai';
import { getToolConfig } from '@/lib/tools-config';
import prisma from '@/lib/prisma';
import { ToolType, Tier } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const userTier: Tier = user?.tier || 'BASIC';

    const body = await req.json();
    const { toolKey, sourceText, parameters, targetModel, sessionId, apiKey: bodyApiKey } = body;

    // Check for custom user API key in headers or body
    const headerApiKey = req.headers.get('x-openai-api-key') || '';
    const customApiKey = (bodyApiKey || headerApiKey || process.env.OPENAI_API_KEY || '').trim();

    if (!toolKey) {
      return NextResponse.json({ error: 'Tool key is required.' }, { status: 400 });
    }

    const toolConfig = getToolConfig(toolKey);
    if (!toolConfig) {
      return NextResponse.json({ error: `Unknown tool key: ${toolKey}` }, { status: 400 });
    }

    // Rate Limiting check
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

    // Run OpenAI Agent with structured output
    const agentResult = await runEducationalToolAgent({
      toolKey: toolKey as ToolType,
      sourceText: sourceText || 'Standard lecture notes and exam curriculum content.',
      parameters: parameters || {},
      targetModel,
      apiKey: customApiKey
    });

    // Safely save generation in database if existing user is present
    let generationId = `gen_${Date.now()}`;
    try {
      let validUserId = null;
      if (user?.id) {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [{ id: user.id }, { email: user.email }]
          }
        });
        if (dbUser) validUserId = dbUser.id;
      }

      if (validUserId) {
        const record = await prisma.aIGeneration.create({
          data: {
            id: generationId,
            userId: validUserId,
            sessionId: sessionId || null,
            toolType: toolKey,
            parameters: JSON.stringify(parameters || {}),
            prompt: sourceText?.slice(0, 500) || '',
            resultData: JSON.stringify(agentResult.data),
            tokensUsed: agentResult.tokensUsed,
            modelName: agentResult.modelUsed,
            durationMs: agentResult.durationMs
          }
        });
        generationId = record.id;

        await prisma.auditLog.create({
          data: {
            userId: validUserId,
            action: 'TOOL_EXECUTED',
            metadata: JSON.stringify({
              toolKey,
              tokens: agentResult.tokensUsed,
              model: agentResult.modelUsed,
              isLive: agentResult.isLiveOpenAI
            })
          }
        });
      }
    } catch (dbErr) {
      console.warn('Generation DB log deferred:', dbErr);
    }

    return NextResponse.json({
      success: true,
      generationId,
      result: agentResult,
      remainingDailyQuota: rateCheck.remaining
    });
  } catch (error: any) {
    console.error('AI Generation API error:', error);
    return NextResponse.json({ error: error.message || 'AI processing failed' }, { status: 500 });
  }
}
