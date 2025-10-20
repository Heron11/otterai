import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getAuth } from '@clerk/remix/ssr.server';
import { ProfileForm } from '~/components/platform/settings/ProfileForm';

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  return json({ userId });
}

export default function SettingsProfilePage() {
  const { userId } = useLoaderData<typeof loader>();
  return <ProfileForm userId={userId} />;
}



