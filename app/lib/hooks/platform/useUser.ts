import { useStore } from '@nanostores/react';
import { userProfileStore, updateUserProfile, upgradeTier, cancelSubscription } from '~/lib/stores/platform/user';

export const useUser = () => {
  const userProfile = useStore(userProfileStore);
  
  return {
    userProfile,
    updateProfile: updateUserProfile,
    upgradeTier,
    cancelSubscription,
  };
};



