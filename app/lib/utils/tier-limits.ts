import type { UserTier } from '~/lib/types/platform/user';

export interface TierLimits {
  name: string;
  price: number;
  projects: number;
  creditsPerMonth: number; // Message-level credit limit
  creditsPerDay?: number; // Optional daily limit (for free tier)
  templates: 'all' | 'basic' | 'limited';
  support: 'community' | 'email' | 'priority';
  customDomains: boolean;
  collaborators: number;
  storageGB: number;
}

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    name: 'Free',
    price: 0,
    projects: 3,
    creditsPerMonth: 50, // 50 messages per month
    creditsPerDay: 3, // 3 messages per day
    templates: 'limited',
    support: 'community',
    customDomains: false,
    collaborators: 0,
    storageGB: 1,
  },
  plus: {
    name: 'Plus',
    price: 19,
    projects: 15,
    creditsPerMonth: 500, // 500 messages per month
    templates: 'basic',
    support: 'email',
    customDomains: true,
    collaborators: 3,
    storageGB: 10,
  },
  pro: {
    name: 'Pro',
    price: 49,
    projects: -1, // unlimited
    creditsPerMonth: 5000, // 5000 messages per month
    templates: 'all',
    support: 'priority',
    customDomains: true,
    collaborators: -1, // unlimited
    storageGB: 100,
  },
};

export const canAccessTemplate = (userTier: UserTier, requiredTier: UserTier): boolean => {
  const tierHierarchy: Record<UserTier, number> = { free: 0, plus: 1, pro: 2 };
  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
};

export const canCreateProject = (userTier: UserTier, currentProjectCount: number): boolean => {
  const limit = TIER_LIMITS[userTier].projects;
  return limit === -1 || currentProjectCount < limit;
};

export const getTierFeatures = (tier: UserTier): string[] => {
  const limits = TIER_LIMITS[tier];
  
  const features: string[] = [];
  
  // Add message limits
  if (limits.creditsPerDay && tier === 'free') {
    features.push(`${limits.creditsPerDay} messages per day (${limits.creditsPerMonth} per month)`);
  } else {
    features.push(`${limits.creditsPerMonth} messages per month`);
  }
  
  features.push(limits.projects === -1 ? 'Unlimited projects' : `Up to ${limits.projects} projects`);
  
  if (limits.templates === 'all') {
    features.push('Access to all templates');
  } else if (limits.templates === 'basic') {
    features.push('Access to Plus templates');
  } else {
    features.push('Access to Free templates');
  }
  
  features.push(
    limits.support === 'priority' ? 'Priority support' : 
    limits.support === 'email' ? 'Email support' : 
    'Community support'
  );
  
  if (limits.customDomains) {
    features.push('Custom domains');
  }
  
  if (limits.collaborators === -1) {
    features.push('Unlimited collaborators');
  } else if (limits.collaborators > 0) {
    features.push(`Up to ${limits.collaborators} collaborators`);
  }
  
  features.push(`${limits.storageGB}GB storage`);
  
  return features;
};



