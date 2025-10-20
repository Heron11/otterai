/**
 * User and Subscription Types
 */

export type UserTier = 'free' | 'plus' | 'pro';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  tier: UserTier;
  credits: number;
  subscription?: {
    status: string;
    currentPeriodEnd: string;
  };
}

