import { useState, useEffect, useRef } from 'react';
import { BETA_BANNER_ENABLED, BETA_BANNER_HEIGHT } from '~/config/banner';

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user has dismissed the banner in this session
    const dismissed = sessionStorage.getItem('beta-banner-dismissed');
    setIsVisible(BETA_BANNER_ENABLED && !dismissed);
  }, []);

  useEffect(() => {
    // Update CSS variable when banner visibility changes
    const updateBannerHeight = () => {
      if (!BETA_BANNER_ENABLED) {
        document.documentElement.style.setProperty('--beta-banner-height', '0px');
        return;
      }
      
      if (bannerRef.current) {
        const height = isVisible ? `${bannerRef.current.offsetHeight}px` : '0px';
        document.documentElement.style.setProperty('--beta-banner-height', height);
      } else if (isVisible) {
        // Fallback to configured height if ref is not available
        document.documentElement.style.setProperty('--beta-banner-height', `${BETA_BANNER_HEIGHT}px`);
      } else {
        document.documentElement.style.setProperty('--beta-banner-height', '0px');
      }
    };

    updateBannerHeight();
    
    // Update on window resize
    window.addEventListener('resize', updateBannerHeight);
    return () => window.removeEventListener('resize', updateBannerHeight);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('beta-banner-dismissed', 'true');
  };

  if (!BETA_BANNER_ENABLED || !isVisible) {
    return null;
  }

  return (
    <div ref={bannerRef} className="bg-[#e86b47]/10 border-b border-[#e86b47]/20 px-4 py-2 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <p className="text-xs md:text-sm text-black flex items-center gap-1.5">
          <span className="text-sm" role="img" aria-label="warning">
            ⚠️
          </span>
          <span>
            <strong>Beta:</strong> OtterAI is in active development. Save work locally.
          </span>
        </p>
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-black hover:text-gray-700 transition-colors p-1 rounded hover:bg-[#e86b47]/10"
          aria-label="Dismiss banner"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

