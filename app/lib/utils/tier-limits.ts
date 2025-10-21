import type { UserTier } from '~/lib/types/platform/user';

export interface TierLimits {
  name: string;
  price: number;
  projects: number;
  creditsPerMonth: number; // Message-level credit limit
  creditsPerDay?: number; // Optional daily limit (for free tier)
  templates: 'all' | 'basic' | 'limited';
  storageGB: number;
  // Future features (not yet implemented):
  // customDomains: boolean;
  // collaborators: number;
  // support: 'community' | 'email' | 'priority';
}

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    name: 'Free',
    price: 0,
    projects: 3,
    creditsPerMonth: 50, // 50 messages per month
    creditsPerDay: 3, // 3 messages per day
    templates: 'limited',
    storageGB: 1,
  },
  plus: {
    name: 'Plus',
    price: 19,
    projects: 15,
    creditsPerMonth: 500, // 500 messages per month
    templates: 'basic',
    storageGB: 10,
  },
  pro: {
    name: 'Pro',
    price: 49,
    projects: -1, // unlimited
    creditsPerMonth: 5000, // 5000 messages per month
    templates: 'all',
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
    features.push(`${limits.creditsPerDay} messages per day (${limits.creditsPerMonth}/month)`);
  } else {
    features.push(`${limits.creditsPerMonth.toLocaleString()} AI messages per month`);
  }
  
  // Projects
  features.push(limits.projects === -1 ? 'Unlimited projects' : `Up to ${limits.projects} projects`);
  
  // Storage
  features.push(`${limits.storageGB}GB project storage`);
  
  // Templates
  if (limits.templates === 'all') {
    features.push('Access to all premium templates');
  } else if (limits.templates === 'basic') {
    features.push('Access to Plus & Free templates');
  } else {
    features.push('Access to basic templates');
  }
  
  // Code export
  features.push('Full code export & download');
  
  // Real-time features
  features.push('Real-time code preview');
  
  // Deployment
  if (tier === 'pro') {
    features.push('Priority AI processing');
    features.push('Advanced deployment options');
    features.push('Beta feature early access');
  } else if (tier === 'plus') {
    features.push('Faster AI responses');
    features.push('One-click deployment');
  } else {
    features.push('Standard deployment');
  }
  
  // Community
  features.push('Community Discord access');
  
  return features;
};



