import { json, type MetaFunction } from '@remix-run/cloudflare';
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
  return (
    <div className="flex flex-col h-full w-full bg-bg-3 dark:bg-black">
      <PlatformNav />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      <FloatingUser />
    </div>
  );
}
