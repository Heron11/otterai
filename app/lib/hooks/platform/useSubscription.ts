import { useStore } from '@nanostores/react';
import { userProfileStore } from '~/lib/stores/platform/user';
import { TIER_LIMITS, canAccessTemplate, canCreateProject } from '~/lib/utils/tier-limits';

export const useSubscription = () => {
  const userProfile = useStore(userProfileStore);
  
  if (!userProfile) {
    return {
      tier: 'free' as const,
      subscription: null,
      limits: TIER_LIMITS.free,
      canAccessTemplate: () => false,
      canCreateProject: () => false,
    };
  }
  
  const tier = userProfile.tier;
  const limits = TIER_LIMITS[tier];
  
  return {
    tier,
    subscription: userProfile.subscription,
    limits,
    canAccessTemplate: (requiredTier: 'free' | 'plus' | 'pro') => canAccessTemplate(tier, requiredTier),
    canCreateProject: (currentCount: number) => canCreateProject(tier, currentCount),
  };
};



