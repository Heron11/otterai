import { Link, useLocation } from '@remix-run/react';
import { useAuth } from '~/lib/hooks/platform/useAuth';

export function FloatingUser() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isBuildPage = location.pathname === '/';

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
      {isBuildPage && (
        <button
          onClick={() => {
            const event = new CustomEvent('toggleSidebar');
            window.dispatchEvent(event);
          }}
          className="flex items-center justify-center w-12 h-12 bg-neutral-800 dark:bg-neutral-800 border border-gray-600 dark:border-gray-600 rounded-full hover:opacity-80 transition-all duration-300 hover:scale-105 shadow-lg"
          title="Open Build Menu"
        >
          <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      <Link
        to="/settings"
        className="flex items-center justify-center w-12 h-12 rounded-full bg-[#e86b47] hover:bg-[#d45a36] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        title="User Settings"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </Link>
    </div>
  );
}
