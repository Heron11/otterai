import { TIER_LIMITS } from '~/lib/utils/tier-limits';
import type { UserTier } from '~/lib/types/platform/user';

interface UsageStatsProps {
  userId: string;
  credits: number;
  tier: UserTier;
}

export function UsageStats({ userId, credits, tier }: UsageStatsProps) {
  const limits = TIER_LIMITS[tier];
  const creditsLimit = limits.creditsPerMonth;
  const creditsUsed = creditsLimit - credits;
  
  // Mock data for other metrics (will be implemented later)
  const storageUsed = 0; // GB
  const storageLimit = limits.storageGB;

  const UsageBar = ({ used, limit, label, unit = '' }: { used: number; limit: number; label: string; unit?: string }) => {
    const percentage = limit === -1 ? 0 : Math.min((used / limit) * 100, 100);
    const isUnlimited = limit === -1;
    
    return (
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-bolt-elements-textPrimary">{label}</span>
          <span className="text-sm text-bolt-elements-textSecondary">
            {used.toLocaleString()}{unit} / {isUnlimited ? '∞' : `${limit.toLocaleString()}${unit}`}
          </span>
        </div>
        <div className="w-full bg-bolt-elements-background-depth-3 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              percentage > 80 ? 'bg-red-500' :
              percentage > 60 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${isUnlimited ? 10 : percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">
          Usage Statistics
        </h3>
        
        <div className="bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg p-6 space-y-6">
          <UsageBar
            used={creditsUsed}
            limit={creditsLimit}
            label="Messages Used This Month"
          />
          
          <div className="text-sm text-bolt-elements-textSecondary">
            You have <span className="font-semibold text-bolt-elements-textPrimary">{credits}</span> messages remaining this month
          </div>
          
          <UsageBar
            used={storageUsed}
            limit={storageLimit}
            label="Storage"
            unit=" GB"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">
          Plan Limits
        </h3>
        
        <div className="bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg p-6">
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-bolt-elements-textSecondary">Current Plan</dt>
              <dd className="text-sm font-medium text-bolt-elements-textPrimary capitalize">
                {tier}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-bolt-elements-textSecondary">Messages per Month</dt>
              <dd className="text-sm font-medium text-bolt-elements-textPrimary">
                {creditsLimit.toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-bolt-elements-textSecondary">Projects</dt>
              <dd className="text-sm font-medium text-bolt-elements-textPrimary">
                {limits.projects === -1 ? 'Unlimited' : limits.projects}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-bolt-elements-textSecondary">Storage</dt>
              <dd className="text-sm font-medium text-bolt-elements-textPrimary">
                {limits.storageGB} GB
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-bolt-elements-textSecondary">Collaborators</dt>
              <dd className="text-sm font-medium text-bolt-elements-textPrimary">
                {limits.collaborators === -1 ? 'Unlimited' : limits.collaborators}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}



