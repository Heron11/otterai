import { useLocation } from '@remix-run/react';
import { useAuth } from '~/lib/hooks/useAuth';
import { useUser } from '@clerk/remix';

export function FloatingUser() {
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const isBuildPage = location.pathname === '/';
  const isChatPage = location.pathname.startsWith('/chat/');
  const showMenuButton = isBuildPage || isChatPage;

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      // Trigger sign in modal for unauthenticated users
      const event = new CustomEvent('showSignInModal');
      window.dispatchEvent(event);
      return;
    }
    // Navigate to settings for authenticated users
    window.location.href = '/settings';
  };

  return (
    <div className="fixed top-20 left-6 z-50 flex flex-col gap-3">
      {showMenuButton && isAuthenticated && (
        <button
          onClick={() => {
            const event = new CustomEvent('toggleSidebar');
            window.dispatchEvent(event);
          }}
          className="flex items-center justify-center w-10 h-10 bg-neutral-800 dark:bg-neutral-800 border border-gray-600 dark:border-gray-600 rounded-full hover:opacity-80 transition-all duration-300 hover:scale-105 shadow-lg"
          title="Open Build Menu"
        >
          <svg className="w-5 h-5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      
      {/* Profile button - always show */}
      <button
        onClick={handleProfileClick}
        className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden border-2 border-[#e86b47] hover:border-[#d45a36]"
        title={isAuthenticated ? "User Settings" : "Sign In"}
      >
        {isAuthenticated && user?.imageUrl ? (
          <img 
            src={user.imageUrl} 
            alt={user.fullName || 'User'} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#e86b47] hover:bg-[#d45a36] flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
}
