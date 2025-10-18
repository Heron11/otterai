import { Link } from '@remix-run/react';
import type { UserTier } from '~/lib/types/platform/user';
import { TIER_LIMITS, getTierFeatures } from '~/lib/utils/tier-limits';

interface PricingCardProps {
  tier: UserTier;
  currentTier?: UserTier;
  highlighted?: boolean;
}

export function PricingCard({ tier, currentTier, highlighted = false }: PricingCardProps) {
  const limits = TIER_LIMITS[tier];
  const features = getTierFeatures(tier);
  const isCurrentPlan = currentTier === tier;

  return (
    <div
      className={`bg-bolt-elements-background-depth-1 rounded-lg p-6 border ${
        highlighted
          ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-elevation'
          : 'border-bolt-elements-borderColor shadow-soft'
      } relative transition-all hover:shadow-elevation card-hover`}
    >
      {highlighted && (
        <div className="absolute top-0 right-6 transform -translate-y-1/2">
          <span className="px-3 py-1 bg-[#e86b47] text-white text-xs font-medium rounded-full shadow-md">
            Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-bolt-elements-textPrimary mb-2">
          {limits.name}
        </h3>
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold text-bolt-elements-textPrimary">
            ${limits.price}
          </span>
          {limits.price > 0 && (
            <span className="ml-2 text-bolt-elements-textSecondary">/month</span>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="text-sm text-bolt-elements-textSecondary">{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <button
          disabled
          className="w-full px-4 py-2 bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary rounded-md font-medium cursor-not-allowed"
        >
          Current Plan
        </button>
      ) : (
        <Link
          to={limits.price > 0 ? `/settings/billing?upgrade=${tier}` : '/signup'}
          className={`block w-full px-4 py-2 text-center rounded-md font-medium transition-all ${
            highlighted
              ? 'bg-[#e86b47] text-white hover:bg-[#d45a36]'
              : 'border border-bolt-elements-borderColor text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2'
          }`}
        >
          {limits.price > 0 ? 'Upgrade' : 'Get Started'}
        </Link>
      )}
    </div>
  );
}



