/**
 * Cancel/Reactivate Subscription Button
 * Directly calls our API which syncs with Stripe
 */

import { useState } from 'react';
import { useFetcher } from '@remix-run/react';

interface CancelButtonProps {
  isScheduledForCancellation: boolean;
  onSuccess?: () => void;
}

export function CancelButton({ isScheduledForCancellation, onSuccess }: CancelButtonProps) {
  const fetcher = useFetcher();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    if (confirm(isScheduledForCancellation 
      ? 'Are you sure you want to reactivate your subscription?' 
      : 'Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      setIsLoading(true);
      const endpoint = isScheduledForCancellation 
        ? '/api/subscription/reactivate' 
        : '/api/subscription/cancel';
      fetcher.submit(null, { method: 'post', action: endpoint });
    }
  };

  // Handle success
  if (fetcher.data?.success && isLoading) {
    setIsLoading(false);
    if (onSuccess) {
      onSuccess();
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || fetcher.state === 'submitting'}
      className="px-4 py-2 bg-[#e86b47] text-white rounded-md font-medium hover:bg-[#d45a36] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading || fetcher.state === 'submitting' 
        ? 'Processing...' 
        : isScheduledForCancellation 
          ? 'Reactivate Subscription' 
          : 'Cancel Subscription'}
    </button>
  );
}

