import type { MetaFunction } from '@remix-run/cloudflare';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { ForgotPasswordForm } from '~/components/platform/auth/ForgotPasswordForm';

export const meta: MetaFunction = () => {
  return [
    { title: 'Forgot Password - OtterAI' },
    { name: 'description', content: 'Reset your OtterAI password' },
  ];
};

export default function ForgotPasswordPage() {
  return (
    <PlatformLayout showFooter={false}>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <ForgotPasswordForm />
      </div>
    </PlatformLayout>
  );
}



