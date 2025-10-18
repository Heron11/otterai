import { useStore } from '@nanostores/react';
import { authStore, login, logout, signup } from '~/lib/stores/platform/auth';

export const useAuth = () => {
  const auth = useStore(authStore);
  
  return {
    ...auth,
    login,
    logout,
    signup,
  };
};



