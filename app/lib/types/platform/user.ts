export type UserTier = 'free' | 'plus' | 'pro';

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export interface User {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  tier: UserTier;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UserProfile extends User {
  subscription: Subscription;
}



