import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe';
import { Tier } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();
    const { targetTier } = body;

    if (!targetTier || targetTier === 'BASIC') {
      return NextResponse.json({ error: 'Invalid subscription tier selected.' }, { status: 400 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const returnUrl = `${protocol}://${host}/billing`;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required. Please sign in to upgrade.' }, { status: 401 });
    }

    if (user.email.toLowerCase() === 'arykothari@gmail.com' || user.tier === 'EDUCATOR') {
      return NextResponse.json({
        error: 'You already possess active EDUCATOR tier privileges with maximum quota allocations and all 15 AI agents unlocked.'
      }, { status: 400 });
    }

    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      tier: targetTier as Exclude<Tier, 'BASIC'>,
      returnUrl
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
