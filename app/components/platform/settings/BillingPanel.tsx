import { Link, useRevalidator } from '@remix-run/react';
import { TIER_LIMITS } from '~/lib/utils/tier-limits';
import { PortalButton } from '~/components/billing/PortalButton';
import { CancelButton } from '~/components/billing/CancelButton';
import type { UserTier } from '~/lib/types/platform/user';
import type { SubscriptionRecord } from '~/lib/.server/subscriptions/queries';

interface BillingPanelProps {
  userProfile: {
    tier: UserTier;
    stripe_customer_id: string | null;
  };
  subscription: SubscriptionRecord | null;
}

export function BillingPanel({ userProfile, subscription }: BillingPanelProps) {
  const { tier, stripe_customer_id } = userProfile;
  const limits = TIER_LIMITS[tier];
  const revalidator = useRevalidator();

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
            {tier !== 'pro' && !subscription?.cancel_at_period_end && (
              <Link
                to="/pricing"
                className="px-4 py-2 bg-[#e86b47] text-white rounded-md font-medium hover:bg-[#d45a36] transition-all"
              >
                Upgrade Plan
              </Link>
            )}
            
            {subscription && tier !== 'free' && (
              <CancelButton
                isScheduledForCancellation={subscription.cancel_at_period_end}
                onSuccess={() => revalidator.revalidate()}
              />
            )}
            
            {stripe_customer_id && (
              <PortalButton
                className="px-4 py-2 bg-[#e86b47] text-white rounded-md font-medium hover:bg-[#d45a36] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Manage Subscription
              </PortalButton>
            )}
          </div>
        </div>
      </div>

      {stripe_customer_id && (
        <div>
          <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">
            Payment Method
          </h3>
          
          <div className="bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg p-6">
            <p className="text-bolt-elements-textSecondary mb-4">
              Manage your payment methods, view invoices, and update billing information through the Stripe Customer Portal.
            </p>
            <PortalButton
              className="px-4 py-2 bg-[#e86b47] text-white rounded-md font-medium hover:bg-[#d45a36] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Open Billing Portal
            </PortalButton>
          </div>
        </div>
      )}
    </div>
  );
}



