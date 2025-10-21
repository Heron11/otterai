import { Link } from '@remix-run/react';
import { TIER_LIMITS } from '~/lib/utils/tier-limits';
import type { UserTier } from '~/lib/types/platform/user';

interface BillingPanelProps {
  userProfile: {
    tier: UserTier;
    stripe_customer_id: string | null;
  };
  subscription: any | null;
}

export function BillingPanel({ userProfile, subscription }: BillingPanelProps) {
  const { tier, stripe_customer_id } = userProfile;
  const limits = TIER_LIMITS[tier];

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        alert('Failed to open billing portal. Please try again.');
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">
          Current Plan
        </h3>
        
        <div className="bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-2xl font-bold text-bolt-elements-textPrimary">
                {limits.name}
              </h4>
              <p className="text-bolt-elements-textSecondary">
                {limits.price > 0 ? `$${limits.price}/month` : 'Free forever'}
              </p>
            </div>
            
            {subscription && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                subscription.status === 'active' ? 'bg-green-500/20 text-green-400' :
                subscription.status === 'past_due' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).replace('_', ' ')}
              </div>
            )}
          </div>

          {subscription?.current_period_end && (
            <p className="text-sm text-bolt-elements-textSecondary mb-4">
              {subscription.cancel_at_period_end ? 'Cancels' : 'Renews'} on {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}

          <div className="flex gap-3 flex-wrap">
            {tier === 'free' && (
              <button
                onClick={handleUpgrade}
                className="px-4 py-2 bg-[#e86b47] text-white rounded-md font-medium hover:bg-[#d45a36] transition-colors"
              >
                Upgrade to Plus
              </button>
            )}
            
            {tier === 'plus' && (
              <button
                onClick={handleUpgrade}
                className="px-4 py-2 bg-[#e86b47] text-white rounded-md font-medium hover:bg-[#d45a36] transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
            
            {tier !== 'free' && stripe_customer_id && (
              <button
                onClick={handleManageSubscription}
                className="px-4 py-2 bg-[#e86b47] text-white rounded-md font-medium hover:bg-[#d45a36] transition-colors"
              >
                Manage Subscription
              </button>
            )}
          </div>
        </div>
      </div>

      {tier !== 'free' && stripe_customer_id && (
        <div>
          <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">
            Payment Method
          </h3>
          
          <div className="bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg p-6">
            <p className="text-bolt-elements-textSecondary mb-4">
              Manage your payment methods, view invoices, and update billing information.
            </p>
            <button
              onClick={handleManageSubscription}
              className="px-4 py-2 bg-[#e86b47] text-white rounded-md font-medium hover:bg-[#d45a36] transition-colors"
            >
              Open Billing Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



