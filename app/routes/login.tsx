import type { MetaFunction } from '@remix-run/cloudflare';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { LoginForm } from '~/components/platform/auth/LoginForm';

export const meta: MetaFunction = () => {
  return [
    { title: 'Login - OtterAI' },
    { name: 'description', content: 'Login to your OtterAI account' },
  ];
};

export default function LoginPage() {
  return (
    <PlatformLayout showFooter={false}>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <LoginForm />
      </div>
    </PlatformLayout>
  );
}



