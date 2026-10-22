import Stripe from 'stripe';
import prisma from './prisma';
import { Tier } from '@/types';

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
export const stripe = new Stripe(stripeSecret, {
  apiVersion: '2024-11-20.acacia' as any,
  typescript: true,
});

export const STRIPE_PLANS: Record<Exclude<Tier, 'BASIC'>, { name: string; priceId: string; amount: number }> = {
  PRO: {
    name: 'Pro Academic',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    amount: 1900 // $19.00
  },
  PREMIUM: {
    name: 'Premium Scholar',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
    amount: 4900 // $49.00
  },
  INSTITUTIONAL: {
    name: 'Institutional Campus',
    priceId: process.env.NEXT_PUBLIC_STRIPE_INSTITUTION_PRICE_ID || 'price_inst_monthly',
    amount: 19900 // $199.00
  },
  EDUCATOR: {
    name: 'Educator VIP & Super Admin',
    priceId: process.env.NEXT_PUBLIC_STRIPE_EDUCATOR_PRICE_ID || 'price_educator_monthly',
    amount: 7900 // $79.00
  }
};

/**
 * Creates a Stripe checkout session for plan upgrades.
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  tier,
  returnUrl
}: {
  userId: string;
  userEmail: string;
  tier: Exclude<Tier, 'BASIC'>;
  returnUrl: string;
}) {
  const plan = STRIPE_PLANS[tier];
  if (!plan) throw new Error(`Invalid plan tier: ${tier}`);

  // Find or create customer
  const user = await prisma.user.findUnique({ where: { id: userId } });
  let customerId = user?.stripeCustomerId;

  if (!customerId && !stripeSecret.startsWith('sk_test_placeholder')) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { userId }
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId }
    });
  }

  // If live Stripe keys are configured
  if (!stripeSecret.startsWith('sk_test_placeholder')) {
    const session = await stripe.checkout.sessions.create({
      customer: customerId || undefined,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `EduAgent Pro - ${plan.name}`,
              description: `Subscription tier upgrade for academic AI tools.`
            },
            unit_amount: plan.amount,
            recurring: { interval: 'month' }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: { userId, targetTier: tier }
    });

    return { url: session.url };
  }

  // Fallback demo sandbox checkout link for immediate test simulation
  return {
    url: `${returnUrl}?mock_checkout=true&targetTier=${tier}`
  };
}

/**
 * Handles Stripe webhook events and updates database state.
 */
export async function handleStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const targetTier = (session.metadata?.targetTier as Tier) || 'PRO';

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            tier: targetTier,
            stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
            stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined
          }
        });

        await prisma.auditLog.create({
          data: {
            userId,
            action: 'TIER_UPGRADE',
            metadata: JSON.stringify({ newTier: targetTier, sessionId: session.id })
          }
        });
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = (invoice as any).subscription as string;
      if (subscriptionId) {
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscriptionId }
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          });
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscription.id }
      });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            tier: 'BASIC',
            stripeSubscriptionId: null
          }
        });

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'SUBSCRIPTION_CANCELED',
            metadata: JSON.stringify({ subscriptionId: subscription.id })
          }
        });
      }
      break;
    }
  }
}
