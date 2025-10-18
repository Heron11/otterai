import type { User, UserProfile, Subscription } from '~/lib/types/platform/user';

export const mockUser: User = {
  id: 'user_1',
  email: 'demo@example.com',
  name: 'Demo User',
  tier: 'free',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-10-15'),
};

export const mockSubscription: Subscription = {
  tier: 'free',
  status: 'active',
  currentPeriodEnd: undefined,
  cancelAtPeriodEnd: false,
};

export const mockUserProfile: UserProfile = {
  ...mockUser,
  subscription: mockSubscription,
};

export const mockProUser: User = {
  id: 'user_2',
  email: 'pro@example.com',
  name: 'Pro User',
  tier: 'pro',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pro',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-10-15'),
};

export const mockProSubscription: Subscription = {
  tier: 'pro',
  status: 'active',
  currentPeriodEnd: new Date('2024-11-15'),
  cancelAtPeriodEnd: false,
  stripeCustomerId: 'cus_mock123',
  stripeSubscriptionId: 'sub_mock123',
};



