import { NextRequest, NextResponse } from 'next/server';
import { stripe, handleStripeWebhookEvent } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    if (signature && webhookSecret && !webhookSecret.startsWith('whsec_placeholder')) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      // In sandbox/development without secret, parse payload directly
      event = JSON.parse(rawBody);
    }

    await handleStripeWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
