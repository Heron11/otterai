import type { MetaFunction } from '@remix-run/cloudflare';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { PricingTable } from '~/components/platform/pricing/PricingTable';
import { useUser } from '~/lib/hooks/platform/useUser';

export const meta: MetaFunction = () => {
  return [
    { title: 'Pricing - OtterAI' },
    { name: 'description', content: 'Choose the perfect plan for your needs' },
  ];
};

export default function PricingPage() {
  const { userProfile } = useUser();

  return (
    <PlatformLayout>
      <PricingTable currentTier={userProfile?.tier} />
    </PlatformLayout>
  );
}



