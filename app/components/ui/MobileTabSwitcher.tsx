import { motion } from 'framer-motion';
import { classNames } from '~/utils/classNames';

export type MobileTabType = 'chat' | 'preview' | 'code';

interface MobileTabSwitcherProps {
  activeTab: MobileTabType;
  onTabChange: (tab: MobileTabType) => void;
  showWorkbench: boolean;
  className?: string;
}

const tabOptions = [
  {
    id: 'chat' as MobileTabType,
    label: 'Chat',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  {
    id: 'preview' as MobileTabType,
    label: 'Preview',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )
  },
  {
    id: 'code' as MobileTabType,
    label: 'Code',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  }
];

export function MobileTabSwitcher({ 
  activeTab, 
  onTabChange, 
  showWorkbench, 
  className 
}: MobileTabSwitcherProps) {
  return (
    <div className={classNames(
      'md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bolt-elements-background-depth-1 border-t border-bolt-elements-borderColor',
      className
    )}>
      <div className="flex items-center justify-center px-4 py-2">
        <div className="flex items-center bg-bolt-elements-background-depth-2 rounded-lg p-1 border border-bolt-elements-borderColor">
          {tabOptions.map((tab) => {
            const isActive = activeTab === tab.id;
            const isDisabled = tab.id !== 'chat' && !showWorkbench;
            
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && onTabChange(tab.id)}
                disabled={isDisabled}
                className={classNames(
                  'relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  {
                    'text-bolt-elements-textPrimary': isActive,
                    'text-bolt-elements-textSecondary': !isActive && !isDisabled,
                    'text-bolt-elements-textTertiary cursor-not-allowed': isDisabled,
                    'hover:text-bolt-elements-textPrimary': !isDisabled && !isActive
                  }
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-tab-indicator"
                    className="absolute inset-0 bg-bolt-elements-button-primary-background rounded-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}