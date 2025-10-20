import { SignIn } from '@clerk/remix';
import { AnimatePresence, motion } from 'framer-motion';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          />
          
          {/* Clerk Card */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="pointer-events-auto relative"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute -top-3 -right-3 z-10 flex items-center justify-center w-8 h-8 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-full hover:bg-bolt-elements-background-depth-3 transition-colors shadow-lg"
                aria-label="Close"
              >
                <svg className="w-4 h-4 text-bolt-elements-textPrimary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <SignIn
                appearance={{
                  elements: {
                    // Root container
                    rootBox: 'w-full',
                    
                    // Main card
                    card: 'bg-white dark:bg-bolt-elements-background-depth-2 shadow-2xl rounded-xl border border-gray-200 dark:border-bolt-elements-borderColor',
                    
                    // Header
                    headerTitle: 'text-2xl font-bold text-gray-900 dark:text-bolt-elements-textPrimary',
                    headerSubtitle: 'text-sm text-gray-600 dark:text-bolt-elements-textSecondary',
                    
                    // Form elements
                    formButtonPrimary:
                      'bg-[#e86b47] hover:bg-[#d45a36] text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md',
                    
                    formFieldLabel: 'text-sm font-medium text-gray-700 dark:text-bolt-elements-textPrimary',
                    formFieldInput:
                      'bg-white dark:bg-bolt-elements-background-depth-3 border border-gray-300 dark:border-bolt-elements-borderColor text-gray-900 dark:text-bolt-elements-textPrimary placeholder:text-gray-400 dark:placeholder:text-bolt-elements-textTertiary rounded-lg focus:ring-2 focus:ring-[#e86b47]/50 focus:border-[#e86b47] transition-all',
                    
                    formFieldInputShowPasswordButton: 'text-gray-600 dark:text-bolt-elements-textSecondary hover:text-gray-900 dark:hover:text-bolt-elements-textPrimary',
                    
                    // Links
                    footerActionLink: 'text-[#e86b47] hover:text-[#d45a36] font-medium transition-colors',
                    footerActionText: 'text-gray-600 dark:text-bolt-elements-textSecondary',
                    
                    // Social buttons
                    socialButtonsBlockButton:
                      'bg-white dark:bg-bolt-elements-background-depth-3 border border-gray-300 dark:border-bolt-elements-borderColor hover:bg-gray-50 dark:hover:bg-bolt-elements-background-depth-1 text-gray-900 dark:text-bolt-elements-textPrimary font-medium rounded-lg transition-all duration-200',
                    socialButtonsBlockButtonText: 'font-medium text-gray-900 dark:text-bolt-elements-textPrimary',
                    
                    // Divider
                    dividerLine: 'bg-gray-300 dark:bg-bolt-elements-borderColor',
                    dividerText: 'text-gray-500 dark:text-bolt-elements-textSecondary text-sm',
                    
                    // Form field errors
                    formFieldErrorText: 'text-red-600 dark:text-red-400 text-sm',
                    
                    // Footer
                    footer: 'bg-gray-50 dark:bg-bolt-elements-background-depth-3 border-t border-gray-200 dark:border-bolt-elements-borderColor',
                    
                    // Alert
                    alertText: 'text-gray-800 dark:text-bolt-elements-textPrimary text-sm',
                    
                    // Identity preview
                    identityPreviewText: 'text-gray-900 dark:text-bolt-elements-textPrimary',
                    identityPreviewEditButton: 'text-[#e86b47] hover:text-[#d45a36]',
                  },
                }}
                routing="virtual"
                signUpUrl="/sign-up"
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

