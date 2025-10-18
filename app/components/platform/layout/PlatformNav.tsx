import { Link } from '@remix-run/react';
import { useAuth } from '~/lib/hooks/platform/useAuth';
import { ThemeToggle } from '~/components/ui/ThemeToggle';

export function PlatformNav() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex">
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
            
            {isAuthenticated && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
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
                  Editor
                </Link>
                <Link
                  to="/projects"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
                >
                  Projects
                </Link>
              </div>
            )}
          </div>

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
                <div className="relative">
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="h-8 w-8 rounded-full bg-[#e86b47] flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Link
                  to="/login"
                  className="text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium rounded-md bg-[#e86b47] text-white hover:bg-[#d45a36] transition-all"
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
}



