import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signJwtToken } from '@/lib/auth';
import { UserSession } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // Try finding user in database
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
    } catch (e) {
      // Database query error
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials. User not found. Please authenticate via Firebase Google Sign-In or Register.' }, { status: 401 });
    }

    // Special provisioning for primary administrator
    if (user.email.toLowerCase() === 'arykothari@gmail.com') {
      user.role = 'SUPER_ADMIN';
      user.tier = 'EDUCATOR';
      user.name = user.name || 'Ary Nipesh Kothari';
    }

    // If user has a passwordHash in DB, check it
    if (user.passwordHash) {
      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
      }
    }

    const sessionPayload: UserSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      tier: user.tier as any,
      institutionId: user.institutionId
    };

    const token = signJwtToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      token
    });

    // Set secure cookie
    response.cookies.set('eduagent_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}
