import { json, type MetaFunction } from '@remix-run/cloudflare';
import { useEffect } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { PlatformNav } from '~/components/platform/layout/PlatformNav';
import { FloatingUser } from '~/components/platform/layout/FloatingUser';

export const meta: MetaFunction = () => {
  return [{ title: 'OtterAI - AI App Builder' }, { name: 'description', content: 'Build web applications with AI-powered development' }];
};

export const loader = () => json({});

export default function Index() {
  // Clear project context when navigating to home/fresh chat
  useEffect(() => {
    async function clearProjectContext() {
      const { clearCurrentProject } = await import('~/lib/stores/project-context');
      clearCurrentProject();
    }
    clearProjectContext();
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-bg-3 dark:bg-black">
      <PlatformNav />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      <FloatingUser />
    </div>
  );
}
