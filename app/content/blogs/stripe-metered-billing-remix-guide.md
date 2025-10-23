---
title: Usage-Based Billing with Stripe Metered + Tiers in Remix
description: Implement metered billing in Remix with Stripe: plans vs tiers, recording usage, webhooks, UI limits, and edge cases—complete with TypeScript examples.
author: OtterAI Team
date: 2025-10-23
tags: [Tutorial, Stripe, SaaS, Billing]
featured: false
coverImage: https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=1200&h=600&fit=crop&q=80
---

# Usage-Based Billing with Stripe Metered + Tiers in Remix

Flat plans are simple, but many SaaS products monetize usage—messages, requests, builds, minutes. This guide shows a practical Stripe metered setup for Remix with clear limits, clean webhooks, and a UI that makes sense to humans.

We’ll keep the tone real, with an occasional nod to OtterAI (otterai.net), a vibe coding app that treats “credits” like a first-class concept.

## Concepts: Plans, Prices, and Usage

- Plans describe packaging (Free, Plus, Pro).
- Prices control billing. Use a “metered” price to bill based on reported usage.
- Usage is recorded per subscription item.

In Stripe Dashboard:
1) Create Products (e.g., “Plus”, “Pro”).
2) Add a “metered” Price to the product (unit: request, message, etc.).
3) Optionally add tiered pricing (volume or graduated tiers).

## Record Usage Events

From your app, record usage against the customer’s active subscription item. Example server utility:

```ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function recordUsage(subscriptionItemId: string, quantity = 1) {
  await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
    quantity,
    action: 'increment',
    timestamp: Math.floor(Date.now() / 1000),
  });
}
```

Call this where the billable action happens (e.g., AI message sent, build completed). Batch if you need to reduce API calls.

## Webhooks for Invoices and Finalization

Listen for these events:

- `invoice.upcoming` – preview costs or warn on overage
- `invoice.finalized` – lock amounts
- `invoice.payment_succeeded` / `failed` – update entitlements

Remix action/route example:

```ts
export async function action({ request }: ActionFunctionArgs) {
  const sig = request.headers.get('stripe-signature')!;
  const body = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response('invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'invoice.finalized':
      // snapshot usage, update app state
      break;
    case 'invoice.payment_succeeded':
      // grant next cycle entitlements
      break;
    case 'invoice.payment_failed':
      // downgrade or pause
      break;
  }
  return new Response('ok');
}
```

## UI Limits that Match Billing

Billing is only useful if users understand their limits. A simple approach is a central map of per-tier limits (projects, credits, storage). For example:

```ts
export const TIER_LIMITS = {
  free: { creditsPerMonth: 50, creditsPerDay: 3 },
  plus: { creditsPerMonth: 300 },
  pro:  { creditsPerMonth: 1000 },
} as const;

export function canSendMessage(tier: 'free'|'plus'|'pro', usedThisMonth: number) {
  const cap = TIER_LIMITS[tier].creditsPerMonth;
  return usedThisMonth < cap;
}
```

Connect that to your usage records so the app and Stripe stay in sync. If you meter messages, show a small progress meter and predict the next invoice at current pace.

## Edge Cases and Tips

- Proration: Upgrades mid-cycle on metered prices often apply next cycle; communicate clearly.
- Backfill: If you batch usage, make sure timestamps reflect event time.
- Retries: Idempotency keys for usage writes prevent double billing.
- Privacy: Don’t send message content—only quantities and metadata.

## Where OtterAI Fits (Light Touch)

OtterAI (otterai.net) maps “credits” to real actions (like AI messages) and uses clear tier limits so users know what they’re getting. The metered strategy here drops right in when your product outgrows flat plans.

## Related Reading

- /blog/stripe-payment-integration-guide
- /blog/settings-billing
- /blog/mvp-launch-one-week

