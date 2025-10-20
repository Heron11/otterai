/**
 * User and Subscription Types
 */

export type UserTier = 'free' | 'plus' | 'pro';

export interface Subscription {
  id: string;
  tier: UserTier;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  tier: UserTier;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  credits: number;
  subscription?: Subscription;
}


