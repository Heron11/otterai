import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { BillingPanel } from '~/components/platform/settings/BillingPanel';
import { requireAuth } from '~/lib/.server/auth/clerk.server';
import { getDatabase } from '~/lib/.server/db/client';
import { getUserProfile } from '~/lib/.server/users/queries';
import { getSubscription } from '~/lib/.server/subscriptions/queries';

export async function loader(args: LoaderFunctionArgs) {
  const auth = await requireAuth(args);
  const db = getDatabase(args.context.cloudflare.env);

  const [userProfile, subscription] = await Promise.all([
    getUserProfile(db, auth.userId!),
    getSubscription(db, auth.userId!),
  ]);

  if (!userProfile) {
    throw new Response('User not found', { status: 404 });
  }

  return json({ 
    userProfile: {
      tier: userProfile.tier,
      stripe_customer_id: userProfile.stripe_customer_id,
    },
    subscription 
  });
}

export default function SettingsBillingPage() {
  const { userProfile, subscription } = useLoaderData<typeof loader>();
  
  return <BillingPanel userProfile={userProfile} subscription={subscription} />;
}



