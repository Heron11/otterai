import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { BillingPanel } from '~/components/platform/settings/BillingPanel';
import type { UserTier } from '~/lib/types/platform/user';

export async function loader(args: LoaderFunctionArgs) {
  // Import server-only modules inside the loader
  const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase } = await import('~/lib/.server/db/client');
  const { getUserProfile } = await import('~/lib/.server/users/queries');
  const { getSubscription, createSubscription } = await import('~/lib/.server/subscriptions/queries');
  const { getStripeClient } = await import('~/lib/.server/stripe/client');
  const { updateUserTier, updateUserStripeCustomer } = await import('~/lib/.server/users/sync');
  const { STRIPE_CONFIG } = await import('~/lib/.server/stripe/config');

  const auth = await requireAuth(args);
  const db = getDatabase(args.context.cloudflare.env);

  const userProfile = await getUserProfile(db, auth.userId!);

  if (!userProfile) {
    throw new Response('User not found', { status: 404 });
  }

  // Default to user's current tier and no subscription (for free users)
  let liveSubscription = null;
  let liveTier: UserTier = userProfile.tier || 'free';

  // Only check Stripe if user has a customer ID or subscription ID
  if (userProfile.stripe_customer_id || userProfile.stripe_subscription_id) {
    try {
      const stripe = getStripeClient(args.context.cloudflare.env);
      let stripeSubscription = null;

      // Case 1: We have the subscription ID - fetch it directly
      if (userProfile.stripe_subscription_id) {
        console.log(`Fetching known subscription ${userProfile.stripe_subscription_id} for user ${auth.userId}`);
        try {
          stripeSubscription = await stripe.subscriptions.retrieve(userProfile.stripe_subscription_id);
        } catch (err) {
          console.error(`Subscription ${userProfile.stripe_subscription_id} not found in Stripe:`, err);
        }
      } 
      // Case 2: We have customer ID but no subscription ID - search for subscriptions
      else if (userProfile.stripe_customer_id) {
        console.log(`Searching for subscriptions for customer ${userProfile.stripe_customer_id}`);
        const subscriptions = await stripe.subscriptions.list({
          customer: userProfile.stripe_customer_id,
          status: 'active',
          limit: 1,
        });
        
        if (subscriptions.data.length > 0) {
          stripeSubscription = subscriptions.data[0];
          console.log(`Discovered active subscription ${stripeSubscription.id} for user ${auth.userId}`);
        }
      }

      // If we found a subscription in Stripe, sync it to D1
      if (stripeSubscription) {
        // Determine tier from price ID
        const priceId = stripeSubscription.items.data[0].price.id;
        if (priceId === STRIPE_CONFIG.prices.plus) {
          liveTier = 'plus';
        } else if (priceId === STRIPE_CONFIG.prices.pro) {
          liveTier = 'pro';
        }

        // Update user tier if subscription is active
        if (stripeSubscription.status === 'active' && liveTier !== userProfile.tier) {
          await updateUserTier(db, auth.userId!, liveTier);
          console.log(`Updated user ${auth.userId} tier to ${liveTier} based on Stripe data`);
        }

        // Update user with subscription ID if we didn't have it
        if (!userProfile.stripe_subscription_id) {
          await updateUserStripeCustomer(
            db, 
            auth.userId!, 
            stripeSubscription.customer as string, 
            stripeSubscription.id
          );
          console.log(`Updated user ${auth.userId} with discovered subscription ID ${stripeSubscription.id}`);
        }

        // Sync subscription details to D1 (UPSERT)
        await createSubscription(db, {
          id: stripeSubscription.id,
          userId: auth.userId!,
          stripeCustomerId: stripeSubscription.customer as string,
          stripePriceId: priceId,
          tier: liveTier,
          status: stripeSubscription.status as any,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        });

        // Build live subscription object
        liveSubscription = {
          id: stripeSubscription.id,
          userId: auth.userId!,
          stripeCustomerId: stripeSubscription.customer as string,
          stripePriceId: priceId,
          tier: liveTier,
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    } catch (error) {
      console.error('Failed to fetch subscription from Stripe:', error);
      // Fall back to D1 data if Stripe API fails, but don't crash
      try {
        liveSubscription = await getSubscription(db, auth.userId!);
      } catch (dbError) {
        console.error('Failed to get subscription from D1:', dbError);
        // Leave as null for free user
      }
    }
  }

  // Return data - null subscription is fine for free users
  return json({ 
    userProfile: {
      tier: liveTier, // Default to 'free' if no tier found
      stripe_customer_id: userProfile.stripe_customer_id || null,
    },
    subscription: liveSubscription // null for free users
  });
}

export default function SettingsBillingPage() {
  const { userProfile, subscription } = useLoaderData<typeof loader>();
  
  return <BillingPanel userProfile={userProfile} subscription={subscription} />;
}



