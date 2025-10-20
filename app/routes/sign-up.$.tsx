import { SignUp } from '@clerk/remix';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bolt-elements-background-depth-1 p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'bg-white dark:bg-bolt-elements-background-depth-2 shadow-2xl rounded-xl border border-gray-200 dark:border-bolt-elements-borderColor',
            headerTitle: 'text-2xl font-bold text-gray-900 dark:text-bolt-elements-textPrimary',
            headerSubtitle: 'text-sm text-gray-600 dark:text-bolt-elements-textSecondary',
            formButtonPrimary:
              'bg-[#e86b47] hover:bg-[#d45a36] text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md',
            formFieldLabel: 'text-sm font-medium text-gray-700 dark:text-bolt-elements-textPrimary',
            formFieldInput:
              'bg-white dark:bg-bolt-elements-background-depth-3 border border-gray-300 dark:border-bolt-elements-borderColor text-gray-900 dark:text-bolt-elements-textPrimary placeholder:text-gray-400 dark:placeholder:text-bolt-elements-textTertiary rounded-lg focus:ring-2 focus:ring-[#e86b47]/50 focus:border-[#e86b47] transition-all',
            formFieldInputShowPasswordButton: 'text-gray-600 dark:text-bolt-elements-textSecondary hover:text-gray-900 dark:hover:text-bolt-elements-textPrimary',
            footerActionLink: 'text-[#e86b47] hover:text-[#d45a36] font-medium transition-colors',
            footerActionText: 'text-gray-600 dark:text-bolt-elements-textSecondary',
            socialButtonsBlockButton:
              'bg-white dark:bg-bolt-elements-background-depth-3 border border-gray-300 dark:border-bolt-elements-borderColor hover:bg-gray-50 dark:hover:bg-bolt-elements-background-depth-1 text-gray-900 dark:text-bolt-elements-textPrimary font-medium rounded-lg transition-all duration-200',
            socialButtonsBlockButtonText: 'font-medium text-gray-900 dark:text-bolt-elements-textPrimary',
            dividerLine: 'bg-gray-300 dark:bg-bolt-elements-borderColor',
            dividerText: 'text-gray-500 dark:text-bolt-elements-textSecondary text-sm',
            formFieldErrorText: 'text-red-600 dark:text-red-400 text-sm',
            footer: 'bg-gray-50 dark:bg-bolt-elements-background-depth-3 border-t border-gray-200 dark:border-bolt-elements-borderColor',
            alertText: 'text-gray-800 dark:text-bolt-elements-textPrimary text-sm',
            identityPreviewText: 'text-gray-900 dark:text-bolt-elements-textPrimary',
            identityPreviewEditButton: 'text-[#e86b47] hover:text-[#d45a36]',
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
      />
    </div>
  );
}

