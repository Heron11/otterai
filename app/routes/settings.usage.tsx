import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getAuth } from '@clerk/remix/ssr.server';
import { getDatabase } from '~/lib/.server/db/client';
import { getUserCredits } from '~/lib/.server/users/queries';
import { UsageStats } from '~/components/platform/settings/UsageStats';

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = getDatabase(args.context.cloudflare.env);
  const creditInfo = await getUserCredits(db, userId);

  return json({ 
    userId, 
    credits: creditInfo?.credits || 0,
    tier: creditInfo?.tier || 'free',
  });
}

export default function SettingsUsagePage() {
  const data = useLoaderData<typeof loader>();
  return <UsageStats {...data} />;
}



