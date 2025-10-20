import { Link } from '@remix-run/react';
import type { UserTier } from '~/lib/types/platform/user';
import { TIER_LIMITS, getTierFeatures } from '~/lib/utils/tier-limits';
import { CheckoutButton } from '~/components/billing/CheckoutButton';

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
      className={`bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative ${
        highlighted
          ? 'border-[#e86b47]/50 ring-2 ring-[#e86b47]/20 shadow-xl hover:shadow-2xl'
          : 'border-gray-200/50 dark:border-white/10 shadow-lg hover:shadow-xl hover:border-[#e86b47]/30'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="px-4 py-2 bg-[#e86b47] text-white text-sm font-semibold rounded-full shadow-lg">
            Most Popular
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-text-primary dark:text-white mb-3">
          {limits.name}
        </h3>
        <div className="flex items-baseline justify-center mb-4">
          <span className="text-5xl font-bold text-text-primary dark:text-white">
            ${limits.price}
          </span>
          {limits.price > 0 && (
            <span className="ml-2 text-lg text-text-secondary dark:text-white/70">/month</span>
          )}
        </div>
        {limits.price === 0 && (
          <div className="text-sm text-text-secondary dark:text-white/70">
            Perfect for getting started
          </div>
        )}
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
              <svg
                className="w-5 h-5 text-[#e86b47]"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span className="text-sm text-text-secondary dark:text-white/70 leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <button
          disabled
          className="w-full px-6 py-3 bg-gray-100 dark:bg-white/20 text-text-secondary dark:text-white/60 rounded-xl font-semibold cursor-not-allowed"
        >
          Current Plan
        </button>
      ) : limits.price > 0 ? (
        <CheckoutButton
          tier={tier as 'plus' | 'pro'}
          className="block w-full px-6 py-3 text-center rounded-xl font-semibold transition-all duration-300 bg-[#e86b47] text-white hover:bg-[#d45a36] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Upgrade Now
        </CheckoutButton>
      ) : (
        <Link
          to="/signup"
          className="block w-full px-6 py-3 text-center rounded-xl font-semibold transition-all duration-300 border-2 border-gray-200 dark:border-white/20 text-text-primary dark:text-white hover:border-[#e86b47] hover:bg-[#e86b47]/5 dark:hover:bg-[#e86b47]/10"
        >
          Get Started Free
        </Link>
      )}
    </div>
  );
}



