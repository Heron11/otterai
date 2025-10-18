import type { MetaFunction } from '@remix-run/cloudflare';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { SignupForm } from '~/components/platform/auth/SignupForm';

export const meta: MetaFunction = () => {
  return [
    { title: 'Sign Up - OtterAI' },
    { name: 'description', content: 'Create your OtterAI account' },
  ];
};

export default function SignupPage() {
  return (
    <PlatformLayout showFooter={false}>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <SignupForm />
      </div>
    </PlatformLayout>
  );
}



