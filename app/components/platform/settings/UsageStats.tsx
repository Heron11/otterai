import { useUser } from '~/lib/hooks/platform/useUser';
import { useStore } from '@nanostores/react';
import { projectsStore } from '~/lib/stores/platform/projects';
import { TIER_LIMITS } from '~/lib/utils/tier-limits';

export function UsageStats() {
  const { userProfile } = useUser();
  const projects = useStore(projectsStore);
  
  if (!userProfile) {
    return null;
  }

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const limits = TIER_LIMITS[userProfile.tier];
  
  // Mock data for demonstration
  const aiTokensUsed = 3500;
  const aiTokensLimit = limits.aiTokensPerDay;
  const storageUsed = 0.3; // GB
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
            used={activeProjects}
            limit={limits.projects}
            label="Active Projects"
          />
          
          <UsageBar
            used={aiTokensUsed}
            limit={aiTokensLimit}
            label="AI Tokens (Today)"
          />
          
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
              <dt className="text-sm text-bolt-elements-textSecondary">Projects</dt>
              <dd className="text-sm font-medium text-bolt-elements-textPrimary">
                {limits.projects === -1 ? 'Unlimited' : limits.projects}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-bolt-elements-textSecondary">AI Tokens/Day</dt>
              <dd className="text-sm font-medium text-bolt-elements-textPrimary">
                {(limits.aiTokensPerDay / 1000).toFixed(0)}K
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



