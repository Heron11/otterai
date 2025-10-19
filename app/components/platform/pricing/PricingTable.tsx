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

      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 rounded-full">
          <svg className="w-5 h-5 text-[#e86b47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-text-primary dark:text-white">
            All plans include AI-powered editor and WebContainer technology
          </span>
        </div>
      </div>
    </div>
  );
}



