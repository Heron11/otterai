import { useAuth as useClerkAuth } from '@clerk/remix';

export function useAuth() {
  const { userId, sessionId, isLoaded } = useClerkAuth();
  
  return {
    isAuthenticated: isLoaded && !!userId,
    userId: userId || null,
    sessionId: sessionId || null,
    isLoaded,
  };
}

