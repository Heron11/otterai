import { memo, useMemo } from 'react';
import { Link, useLocation } from '@remix-run/react';
import { useAuth } from '~/lib/hooks/useAuth';
import { ThemeToggle } from '~/components/ui/ThemeToggle';

export const PlatformNav = memo(function PlatformNav() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isBuildPage = useMemo(() => location.pathname === '/', [location.pathname]);

  return (
    <nav className="border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 h-[var(--header-height)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center gap-2">
              <img 
                src="/lightmodelogonew.svg" 
                alt="OtterAI Logo" 
                className="h-10 dark:hidden"
              />
              <img 
                src="/darkmodelogonew.svg" 
                alt="OtterAI Logo" 
                className="h-10 hidden dark:block"
              />
            </Link>
          </div>

          {/* Center nav - positioned identically to logo but centered */}
          {isAuthenticated && (
            <div className="hidden sm:flex sm:space-x-6 items-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/templates"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
              >
                Templates
              </Link>
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
              >
                Build
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
              >
                Projects
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
              >
                Pricing
              </Link>
            </div>
          )}

          {/* Right side - theme toggle, user menu */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated && (
              <Link
                to="/pricing"
                className="text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
              >
                Pricing
              </Link>
            )}
            
            {isAuthenticated ? (
              <>
                <ThemeToggle />
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Link
                  to="/sign-in"
                  className="text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/sign-up"
                  className="px-6 py-2 text-sm font-medium rounded-full bg-[#e86b47] text-white hover:bg-[#d45a36] transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
});



