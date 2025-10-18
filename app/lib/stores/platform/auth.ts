import { atom, map } from 'nanostores';
import type { AuthState, AuthUser } from '~/lib/types/platform/auth';
import { mockUser } from '~/lib/mock/users';

// Initialize with mock authenticated state for UI development
const initialState: AuthState = {
  isAuthenticated: true, // Set to true for development
  user: {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    tier: mockUser.tier,
    avatar: mockUser.avatar,
  },
  token: 'mock_token_123',
  loading: false,
  error: null,
};

export const authStore = map<AuthState>(initialState);

export const login = (email: string, password: string) => {
  authStore.setKey('loading', true);
  authStore.setKey('error', null);
  
  // Mock login - in production, this would call an API
  setTimeout(() => {
    authStore.set({
      isAuthenticated: true,
      user: {
        id: mockUser.id,
        email,
        name: mockUser.name,
        tier: mockUser.tier,
        avatar: mockUser.avatar,
      },
      token: 'mock_token_123',
      loading: false,
      error: null,
    });
  }, 500);
};

export const logout = () => {
  authStore.set({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
  });
};

export const signup = (name: string, email: string, password: string, tier: 'free' | 'plus' | 'pro' = 'free') => {
  authStore.setKey('loading', true);
  authStore.setKey('error', null);
  
  // Mock signup - in production, this would call an API
  setTimeout(() => {
    authStore.set({
      isAuthenticated: true,
      user: {
        id: 'new_user_' + Date.now(),
        email,
        name,
        tier,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      },
      token: 'mock_token_new',
      loading: false,
      error: null,
    });
  }, 500);
};

export const forgotPassword = (email: string) => {
  authStore.setKey('loading', true);
  authStore.setKey('error', null);
  
  // Mock forgot password - in production, this would call an API
  setTimeout(() => {
    authStore.setKey('loading', false);
  }, 500);
};



