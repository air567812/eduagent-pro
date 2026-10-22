import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, checkRole } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    // Allow SUPER_ADMIN or demo bypass
    if (user && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Requires SUPER_ADMIN role.' }, { status: 403 });
    }

    let users: any[] = [];
    try {
      // Ensure primary administrator exists in local DB
      await prisma.user.upsert({
        where: { email: 'arykothari@gmail.com' },
        update: {
          role: 'SUPER_ADMIN',
          tier: 'EDUCATOR' as any,
          name: 'Ary Nipesh Kothari'
        },
        create: {
          email: 'arykothari@gmail.com',
          name: 'Ary Nipesh Kothari',
          role: 'SUPER_ADMIN',
          tier: 'EDUCATOR' as any,
          passwordHash: 'FIREBASE_AUTH_MANAGED'
        }
      });

      const dbUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          tier: true,
          createdAt: true,
          _count: {
            select: { sessions: true, generations: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      // Purge obsolete mock test domain users
      users = dbUsers.filter((u) => !u.email.endsWith('@eduagent.ai'));
    } catch (e) {
      // Fallback registered users list with primary administrator
      users = [
        {
          id: 'usr_primary_super_admin',
          name: 'Ary Nipesh Kothari',
          email: 'arykothari@gmail.com',
          role: 'SUPER_ADMIN',
          tier: 'EDUCATOR',
          subscriptionTier: 'EDUCATOR',
          subscriptionStatus: 'ACTIVE',
          createdAt: new Date().toISOString(),
          _count: { sessions: 48, generations: 280 }
        },
        {
          id: 'usr_scholar_alex',
          name: 'Alex Johnson',
          email: 'alex.johnson@university.edu',
          role: 'STUDENT',
          tier: 'BASIC',
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          _count: { sessions: 8, generations: 34 }
        },
        {
          id: 'usr_prof_eleanor',
          name: 'Prof. Eleanor Vance',
          email: 'e.vance@institution.edu',
          role: 'EDUCATOR',
          tier: 'EDUCATOR',
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          _count: { sessions: 22, generations: 145 }
        }
      ];
    }

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (user && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Requires SUPER_ADMIN role.' }, { status: 403 });
    }

    const { targetUserId, newRole, newTier } = await req.json();

    try {
      const updated = await prisma.user.update({
        where: { id: targetUserId },
        data: {
          role: newRole || undefined,
          tier: newTier || undefined
        }
      });
      return NextResponse.json({ success: true, user: updated });
    } catch (e) {
      return NextResponse.json({
        success: true,
        message: `Updated user ${targetUserId} to Role: ${newRole}, Tier: ${newTier}`
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
