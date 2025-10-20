import type { UserTier } from '~/lib/types/platform/user';
import { PricingCard } from './PricingCard';

interface PricingTableProps {
  currentTier?: UserTier;
}

export function PricingTable({ currentTier }: PricingTableProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PricingCard tier="free" currentTier={currentTier} />
        <PricingCard tier="plus" currentTier={currentTier} highlighted />
        <PricingCard tier="pro" currentTier={currentTier} />
      </div>

    </div>
  );
}



