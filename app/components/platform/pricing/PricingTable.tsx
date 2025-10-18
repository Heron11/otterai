import type { UserTier } from '~/lib/types/platform/user';
import { PricingCard } from './PricingCard';

interface PricingTableProps {
  currentTier?: UserTier;
}

export function PricingTable({ currentTier }: PricingTableProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-bolt-elements-textPrimary mb-4">
          Choose the perfect plan for you
        </h1>
        <p className="text-xl text-bolt-elements-textSecondary">
          Start free and scale as you grow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <PricingCard tier="free" currentTier={currentTier} />
        <PricingCard tier="plus" currentTier={currentTier} highlighted />
        <PricingCard tier="pro" currentTier={currentTier} />
      </div>

      <div className="mt-12 text-center text-sm text-bolt-elements-textSecondary">
        <p>All plans include access to our AI-powered editor and WebContainer technology</p>
      </div>
    </div>
  );
}



