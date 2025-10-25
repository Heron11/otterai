import { json, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { PlatformNav } from '~/components/platform/layout/PlatformNav';
import { FloatingUser } from '~/components/platform/layout/FloatingUser';
import { getTemplateById } from '~/lib/mock/templates';

export const meta: MetaFunction = () => {
  return [{ title: 'OtterAI - AI App Builder' }, { name: 'description', content: 'Build web applications with AI-powered development' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const templateId = url.searchParams.get('template');
  
  if (templateId) {
    const template = getTemplateById(templateId);
    if (template) {
      // Just pass template info immediately - no GitHub fetching on server
      // Files will be fetched client-side for better UX
      return json({ 
        templateId, 
        template, 
        hasTemplate: true,
        loadingTemplate: true // Flag to indicate files need to be fetched
      });
    }
  }
  
  return json({ hasTemplate: false });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="flex flex-col h-full w-full bg-bg-3 dark:bg-black">
      <PlatformNav />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat templateData={data} />}</ClientOnly>
      <FloatingUser />
    </div>
  );
}
