import { useUser } from '@clerk/remix';
import { UserProfile, SignOutButton } from '@clerk/remix';

interface ProfileFormProps {
  userId: string;
}

export function ProfileForm({ userId }: ProfileFormProps) {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-bolt-elements-textSecondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none space-y-6">
      <UserProfile
        appearance={{
          elements: {
            // Root container
            rootBox: 'w-full',
            
            // Main card - add padding and styling without shadow
            card: 'bg-white dark:bg-bolt-elements-background-depth-2 border border-gray-200 dark:border-bolt-elements-borderColor rounded-xl p-10 shadow-none !shadow-none',
            
            // Alternative card selectors
            cardBox: 'bg-white dark:bg-bolt-elements-background-depth-2',
            main: 'bg-white dark:bg-bolt-elements-background-depth-2',
            scrollBox: 'bg-white dark:bg-bolt-elements-background-depth-2',
            
            // Hide the navbar
            navbar: 'hidden',
            
            // Page container with internal spacing
            pageScrollBox: 'px-4 py-2',
            page: 'bg-transparent',
            
            // Header styling with better typography
            headerTitle: 'text-3xl font-bold text-gray-900 dark:text-bolt-elements-textPrimary mb-3 tracking-tight',
            headerSubtitle: 'text-base text-gray-600 dark:text-bolt-elements-textSecondary mb-8 leading-relaxed',
            
            // Profile header with better dark mode support
            profileSectionHeaderTitle: 'text-lg font-bold text-gray-900 dark:text-bolt-elements-textPrimary',
            profileSectionHeaderSubtitle: 'text-sm text-gray-600 dark:text-bolt-elements-textSecondary mt-1',
            
            // Form elements with better spacing
            formButtonPrimary:
              'bg-[#e86b47] hover:bg-[#d45a36] text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md px-6 py-3 text-sm',
            
            formFieldLabel: 'text-sm font-semibold text-gray-800 dark:text-bolt-elements-textPrimary mb-2 block',
            formFieldInput:
              'bg-white dark:bg-bolt-elements-background-depth-3 border border-gray-300 dark:border-bolt-elements-borderColor text-gray-900 dark:text-bolt-elements-textPrimary placeholder:text-gray-400 dark:placeholder:text-bolt-elements-textTertiary rounded-lg focus:ring-2 focus:ring-[#e86b47]/50 focus:border-[#e86b47] transition-all px-4 py-3 text-sm w-full',
            
            formFieldInputShowPasswordButton: 'text-gray-500 dark:text-bolt-elements-textSecondary hover:text-gray-700 dark:hover:text-bolt-elements-textPrimary p-2',
            
            // Links with better typography
            footerActionLink: 'text-[#e86b47] hover:text-[#d45a36] font-semibold transition-colors text-sm',
            footerActionText: 'text-gray-600 dark:text-bolt-elements-textSecondary text-sm leading-relaxed',
            
            // Badge with better styling
            badge: 'bg-[#e86b47] text-white text-xs font-semibold px-3 py-1 rounded-full',
            
            // Avatar with better styling
            avatarBox: 'border-3 border-[#e86b47]',
            
            // Profile sections with better spacing
            profileSection: 'border-t border-gray-200 dark:border-bolt-elements-borderColor py-6',
            profileSectionTitle: 'text-lg font-bold text-gray-900 dark:text-bolt-elements-textPrimary mb-3 tracking-tight',
            profileSectionContent: 'text-gray-700 dark:text-bolt-elements-textSecondary leading-relaxed',
            
            // Profile fields with better dark mode support
            profileSectionField: 'text-gray-700 dark:text-white',
            profileSectionFieldLabel: 'text-sm font-medium text-gray-900 dark:text-white',
            profileSectionFieldValue: 'text-gray-700 dark:text-white',
            
            // User name and profile details
            profileSection__title: 'text-gray-900 dark:text-white',
            profileSection__subtitle: 'text-gray-700 dark:text-white',
            
            // More specific user name selectors
            userPreview: 'text-gray-900 dark:text-white',
            userPreviewMainIdentifier: 'text-gray-900 dark:text-white',
            userPreviewSecondaryIdentifier: 'text-gray-700 dark:text-white',
            userButton: 'text-gray-900 dark:text-white',
            
            // Accordion with better styling
            accordionTriggerButton: 'text-gray-900 dark:text-bolt-elements-textPrimary hover:bg-gray-50 dark:hover:bg-bolt-elements-background-depth-2 rounded-lg transition-colors p-4 font-semibold',
            
            // Profile details with better typography
            profileSectionPrimaryButton: 'text-[#e86b47] hover:text-[#d45a36] font-semibold text-sm px-4 py-2 rounded-lg border border-[#e86b47] hover:bg-[#e86b47] hover:text-white transition-all',
            profileSectionTitle__danger: 'text-red-600 dark:text-red-400 font-bold',
            profileSectionContent__danger: 'text-red-700 dark:text-red-300 leading-relaxed',
            
            // Connected accounts with better styling
            connectedAccountButton: 'border border-gray-300 dark:border-bolt-elements-borderColor hover:bg-gray-50 dark:hover:bg-bolt-elements-background-depth-2 transition-colors p-4 rounded-lg',
            connectedAccountButtonText: 'text-gray-900 dark:text-white font-medium',
            
            // Connected account details
            connectedAccount: 'text-gray-700 dark:text-white',
            connectedAccount__identifier: 'text-gray-700 dark:text-white',
            connectedAccounts: 'text-gray-700 dark:text-white',
            connectedAccounts__identifier: 'text-gray-700 dark:text-white',
            connectedAccounts__tag: 'text-gray-700 dark:text-white',
            
            // Email addresses with better dark mode support
            emailAddressRow: 'text-gray-700 dark:text-white',
            emailAddressRowLabel: 'text-sm font-medium text-gray-900 dark:text-white',
            emailAddressRowValue: 'text-gray-700 dark:text-white',
            
            // Specific email address elements
            emailAddress: 'text-gray-700 dark:text-white',
            emailAddress__identifier: 'text-gray-700 dark:text-white',
            emailAddresses: 'text-gray-700 dark:text-white',
            emailAddresses__identifier: 'text-gray-700 dark:text-white',
            emailAddresses__tag: 'text-gray-700 dark:text-white',
            
            // Identity preview with better dark mode
            identityPreview: 'bg-gray-50 dark:bg-bolt-elements-background-depth-2 border border-gray-200 dark:border-bolt-elements-borderColor rounded-lg p-4',
            identityPreviewText: 'text-gray-900 dark:text-bolt-elements-textPrimary',
            identityPreviewSecondaryIdentifier: 'text-gray-600 dark:text-bolt-elements-textSecondary',
            
            // Divider with better styling
            dividerLine: 'bg-gray-300 dark:bg-bolt-elements-borderColor my-6',
            dividerText: 'text-gray-500 dark:text-bolt-elements-textSecondary text-sm font-medium',
            
            // Alert with better typography
            alertText: 'text-gray-800 dark:text-bolt-elements-textPrimary text-sm leading-relaxed',
            alertText__error: 'text-red-600 dark:text-red-400 font-medium',
            alertText__warning: 'text-yellow-600 dark:text-yellow-400 font-medium',
            alertText__success: 'text-green-600 dark:text-green-400 font-medium',
            
            // Additional elements for better spacing
            formFieldRow: 'mb-6',
            formFieldInputContainer: 'relative',
            profileSectionHeader: 'mb-4',
            profileSectionHeaderTitle: 'text-lg font-bold text-gray-900 dark:text-bolt-elements-textPrimary',
            profileSectionHeaderSubtitle: 'text-sm text-gray-600 dark:text-bolt-elements-textSecondary mt-1',
            
            // Global text overrides for dark mode
            '*': 'dark:text-white',
            'p': 'dark:text-white',
            'span': 'dark:text-white',
            'div': 'dark:text-white',
          },
        }}
        routing="path"
        path="/settings/profile"
      />

      {/* Sign Out Button */}
      <div className="bg-white dark:bg-bolt-elements-background-depth-2 border border-gray-200 dark:border-bolt-elements-borderColor rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-bolt-elements-textPrimary mb-1">
              Sign Out
            </h3>
            <p className="text-sm text-gray-600 dark:text-bolt-elements-textSecondary">
              Sign out of your account on this device
            </p>
          </div>
          <SignOutButton>
            <button className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-semibold rounded-lg transition-all duration-200 px-6 py-3 text-sm shadow-sm hover:shadow-md">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}



