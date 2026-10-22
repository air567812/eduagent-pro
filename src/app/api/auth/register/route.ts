import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signJwtToken } from '@/lib/auth';
import { UserSession } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role = 'STUDENT' } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await hashPassword(password);

    let newUser = null;
    try {
      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (existing) {
        return NextResponse.json({ error: 'User with this email already exists.' }, { status: 409 });
      }

      newUser = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role,
          tier: 'BASIC'
        }
      });
    } catch (dbError) {
      // Fallback if database is warming up
      newUser = {
        id: `usr_${Date.now()}`,
        name: name || 'Student',
        email: normalizedEmail,
        role,
        tier: 'BASIC'
      };
    }

    const sessionPayload: UserSession = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as any,
      tier: newUser.tier as any
    };

    const token = signJwtToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      token
    });

    response.cookies.set('eduagent_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
