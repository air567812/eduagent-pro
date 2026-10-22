import prisma from './prisma';
import { TIER_LIMITS } from './limits';
import { Tier } from '@/types';

// In-memory quick cache for rate limiting to minimize DB roundtrips
const requestCounters = new Map<string, { count: number; date: string }>();

export async function checkAndIncrementRateLimit(userId: string, tier: Tier): Promise<{ allowed: boolean; remaining: number; maxLimit: number }> {
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.BASIC;
  const maxLimit = limits.dailyAiRequests;
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `${userId}:${today}`;

  // Check in-memory fast cache
  let cached = requestCounters.get(cacheKey);
  if (!cached || cached.date !== today) {
    cached = { count: 0, date: today };
  }

  // Also sync with database usage record if user exists in DB
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { email: userId }]
      }
    });

    if (existingUser) {
      const existingRecord = await prisma.usageRecord.findUnique({
        where: {
          userId_date: {
            userId: existingUser.id,
            date: today
          }
        }
      });

      if (existingRecord) {
        cached.count = Math.max(cached.count, existingRecord.aiRequestsCount);
      }

      if (cached.count >= maxLimit) {
        return { allowed: false, remaining: 0, maxLimit };
      }

      cached.count += 1;
      requestCounters.set(cacheKey, cached);

      await prisma.usageRecord.upsert({
        where: {
          userId_date: {
            userId: existingUser.id,
            date: today
          }
        },
        update: {
          aiRequestsCount: { increment: 1 }
        },
        create: {
          userId: existingUser.id,
          date: today,
          aiRequestsCount: 1,
          imagesUploaded: 0,
          documentsUploaded: 0,
          tokensConsumed: 0
        }
      });

      return {
        allowed: true,
        remaining: Math.max(0, maxLimit - cached.count),
        maxLimit
      };
    }
  } catch (error) {
    // Graceful fallback to memory
  }

  // Fallback for anonymous / guest user in-memory tracking
  if (cached.count >= maxLimit) {
    return { allowed: false, remaining: 0, maxLimit };
  }

  cached.count += 1;
  requestCounters.set(cacheKey, cached);

  return {
    allowed: true,
    remaining: Math.max(0, maxLimit - cached.count),
    maxLimit
  };
}
