import { Link } from '@remix-run/react';
import { useUser } from '~/lib/hooks/platform/useUser';
import { TIER_LIMITS } from '~/lib/utils/tier-limits';

export function BillingPanel() {
  const { userProfile, cancelSubscription } = useUser();
  
  if (!userProfile) {
    return null;
  }

  const { tier, subscription } = userProfile;
  const limits = TIER_LIMITS[tier];

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      cancelSubscription();
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
            
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              subscription.status === 'active' ? 'bg-green-500/20 text-green-400' :
              subscription.status === 'past_due' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).replace('_', ' ')}
            </div>
          </div>

          {subscription.currentPeriodEnd && (
            <p className="text-sm text-bolt-elements-textSecondary mb-4">
              {subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} on {subscription.currentPeriodEnd.toLocaleDateString()}
            </p>
          )}

          <div className="flex gap-3">
            {tier !== 'pro' && (
              <Link
                to="/pricing"
                className="px-4 py-2 bg-[#e86b47] text-white rounded-md font-medium hover:bg-[#d45a36] transition-all"
              >
                Upgrade Plan
              </Link>
            )}
            
            {tier !== 'free' && !subscription.cancelAtPeriodEnd && (
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 border border-bolt-elements-borderColor text-bolt-elements-textPrimary rounded-md font-medium hover:bg-bolt-elements-background-depth-2 transition-colors"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">
          Payment Method
        </h3>
        
        <div className="bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg p-6">
          <p className="text-bolt-elements-textSecondary mb-4">
            Payment integration coming soon. You'll be able to manage your payment methods here.
          </p>
          <button
            disabled
            className="px-4 py-2 bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary rounded-md font-medium cursor-not-allowed"
          >
            Add Payment Method
          </button>
        </div>
      </div>
    </div>
  );
}



