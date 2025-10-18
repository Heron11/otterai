import { atom } from 'nanostores';
import type { UserProfile, UserTier } from '~/lib/types/platform/user';
import { mockUserProfile } from '~/lib/mock/users';

export const userProfileStore = atom<UserProfile | null>(mockUserProfile);

export const updateUserProfile = (updates: Partial<UserProfile>) => {
  const current = userProfileStore.get();
  if (current) {
    userProfileStore.set({ 
      ...current, 
      ...updates,
      updatedAt: new Date()
    });
  }
};

export const upgradeTier = (newTier: UserTier) => {
  const current = userProfileStore.get();
  if (current) {
    userProfileStore.set({
      ...current,
      tier: newTier,
      subscription: {
        ...current.subscription,
        tier: newTier,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });
  }
};

export const cancelSubscription = () => {
  const current = userProfileStore.get();
  if (current) {
    userProfileStore.set({
      ...current,
      subscription: {
        ...current.subscription,
        cancelAtPeriodEnd: true,
      },
    });
  }
};

