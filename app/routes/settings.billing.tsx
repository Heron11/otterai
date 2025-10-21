import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { BillingPanel } from '~/components/platform/settings/BillingPanel';
import type { UserTier } from '~/lib/types/platform/user';

export async function loader(args: LoaderFunctionArgs) {
  try {
    // Import server-only modules inside the loader
    const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
    const { getDatabase } = await import('~/lib/.server/db/client');
    const { getUserProfile } = await import('~/lib/.server/users/queries');

    const auth = await requireAuth(args);
    
    // Handle both local and production environments
    const env = args.context.cloudflare?.env || args.context;
    const db = getDatabase(env);

    const userProfile = await getUserProfile(db, auth.userId!);

    if (!userProfile) {
      throw new Response('User not found', { status: 404 });
    }

    // Always return basic user info - let the component handle the display
    return json({ 
      userProfile: {
        tier: userProfile.tier || 'free',
        stripe_customer_id: userProfile.stripe_customer_id || null,
      },
      subscription: null // Simplified - no complex subscription logic
    });
  } catch (error) {
    console.error('Billing loader error:', error);
    // Return a basic response even if there's an error
    return json({ 
      userProfile: {
        tier: 'free',
        stripe_customer_id: null,
      },
      subscription: null
    });
  }
}

export default function SettingsBillingPage() {
  const { userProfile, subscription } = useLoaderData<typeof loader>();
  
  return <BillingPanel userProfile={userProfile} subscription={subscription} />;
}



