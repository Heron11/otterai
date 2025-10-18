import type { MetaFunction } from '@remix-run/cloudflare';
import { Link, Outlet, useLocation } from '@remix-run/react';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';

export const meta: MetaFunction = () => {
  return [
    { title: 'Settings - OtterAI' },
    { name: 'description', content: 'Manage your account settings' },
  ];
};

export default function SettingsLayout() {
  const location = useLocation();
  
  const tabs = [
    { path: '/settings/profile', label: 'Profile' },
    { path: '/settings/billing', label: 'Billing' },
    { path: '/settings/usage', label: 'Usage' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || (path === '/settings/profile' && location.pathname === '/settings');
  };

  return (
    <PlatformLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-bolt-elements-textPrimary mb-8">
          Settings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Settings navigation */}
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(tab.path)
                    ? 'bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary'
                    : 'text-bolt-elements-textSecondary hover:bg-bolt-elements-background-depth-2 hover:text-bolt-elements-textPrimary'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          {/* Settings content */}
          <div className="md:col-span-3">
            <div className="bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}



