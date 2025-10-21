import { useState, useEffect } from 'react';

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner in this session
    const dismissed = sessionStorage.getItem('beta-banner-dismissed');
    setIsVisible(!dismissed);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('beta-banner-dismissed', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-black flex items-center gap-2 flex-1">
          <span className="text-base" role="img" aria-label="warning">
            ⚠️
          </span>
          <span>
            <strong>Beta Notice:</strong> OtterAI is in active development. Please save important work locally.
            We're working hard to make it great!
          </span>
        </p>
        <button
          onClick={handleDismiss}
          className="text-black hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-amber-500/10 text-sm font-medium"
          aria-label="Dismiss banner"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

