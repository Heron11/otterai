import { Link } from '@remix-run/react';
import type { UserTier } from '~/lib/types/platform/user';

interface UpgradePromptProps {
  requiredTier: UserTier;
  feature: string;
}

export function UpgradePrompt({ requiredTier, feature }: UpgradePromptProps) {
  return (
    <div className="bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-yellow-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-bolt-elements-textPrimary">
            Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
          </h3>
          <p className="mt-2 text-sm text-bolt-elements-textSecondary">
            {feature} requires a {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} subscription.
            Upgrade now to unlock this feature and more.
          </p>
          <div className="mt-4">
            <Link
              to="/pricing"
              className="inline-flex items-center px-4 py-2 bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text rounded-md font-medium hover:bg-bolt-elements-button-primary-backgroundHover transition-colors"
            >
              View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



