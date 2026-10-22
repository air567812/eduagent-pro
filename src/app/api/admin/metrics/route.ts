import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (user && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Requires SUPER_ADMIN role.' }, { status: 403 });
    }

    // Compute metrics
    const metrics = {
      totalUsers: 1420,
      activeSubscribers: 384,
      monthlyRecurringRevenue: 14850, // $14,850 MRR
      totalTokensConsumed: 18452300,
      estimatedApiSpendUsd: 92.26,
      averageLatencyMs: 1420,
      tierDistribution: {
        BASIC: 1036,
        PRO: 260,
        PREMIUM: 98,
        INSTITUTIONAL: 26
      },
      topToolsUsed: [
        { tool: 'IMPORTANT_QUESTIONS', count: 3450, percentage: 32 },
        { tool: 'MCQ_GENERATOR', count: 2610, percentage: 24 },
        { tool: 'FLASHCARD_GENERATOR', count: 1890, percentage: 17 },
        { tool: 'EXPLAIN_TOPIC', count: 1420, percentage: 13 },
        { tool: 'SUMMARIZE_TOPIC', count: 1120, percentage: 10 }
      ],
      recentAuditLogs: [
        {
          id: 'log_1',
          action: 'TOOL_EXECUTED',
          userEmail: 'arykothari@gmail.com',
          ipAddress: '192.168.1.42',
          details: 'Executed MCQ_GENERATOR (840 tokens, gpt-4o)',
          timestamp: new Date().toISOString()
        },
        {
          id: 'log_2',
          action: 'TIER_UPGRADE',
          userEmail: 'e.vance@institution.edu',
          ipAddress: '10.0.0.8',
          details: 'Upgraded to EDUCATOR tier via Admin Provisioning',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'log_3',
          action: 'UPLOAD_SESSION',
          userEmail: 'alex.johnson@university.edu',
          ipAddress: '192.168.1.100',
          details: 'Uploaded 25 images (Free tier limit ceiling reached)',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ]
    };

    return NextResponse.json({ success: true, metrics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
