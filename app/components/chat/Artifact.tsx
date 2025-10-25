import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { computed } from 'nanostores';
import { memo, useEffect, useRef, useState, useCallback } from 'react';
import { createHighlighter, type BundledLanguage, type BundledTheme, type HighlighterGeneric } from 'shiki';
import type { ActionState } from '~/lib/runtime/action-runner';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';

const highlighterOptions = {
  langs: ['shell'],
  themes: ['light-plus', 'dark-plus'],
};

const shellHighlighter: HighlighterGeneric<BundledLanguage, BundledTheme> =
  import.meta.hot?.data.shellHighlighter ?? (await createHighlighter(highlighterOptions));

if (import.meta.hot) {
  import.meta.hot.data.shellHighlighter = shellHighlighter;
}

interface ArtifactProps {
  messageId: string;
}

export const Artifact = memo(({ messageId }: ArtifactProps) => {
  const userToggledActions = useRef(false);
  const [showActions, setShowActions] = useState(false);

  const artifacts = useStore(workbenchStore.artifacts);
  const artifact = artifacts[messageId];

  const actions = useStore(
    computed(artifact.runner.actions, (actions) => {
      return Object.values(actions);
    }),
  );

  const toggleActions = useCallback(() => {
    userToggledActions.current = true;
    setShowActions(prev => !prev);
  }, []);

  const handleWorkbenchToggle = useCallback(() => {
    const showWorkbench = workbenchStore.showWorkbench.get();
    workbenchStore.showWorkbench.set(!showWorkbench);
  }, []);

  useEffect(() => {
    if (actions.length && !showActions && !userToggledActions.current) {
      setShowActions(true);
    }
  }, [actions, showActions]);

  return (
    <div className="artifact border border-bolt-elements-borderColor flex flex-col overflow-hidden rounded-lg w-full transition-border duration-150">
      <div className="flex">
        <button
          className="flex items-stretch bg-bolt-elements-artifacts-background hover:bg-bolt-elements-artifacts-backgroundHover w-full overflow-hidden"
          onClick={handleWorkbenchToggle}
        >
          <div className="px-5 p-3.5 w-full text-left">
            <div className="w-full text-bolt-elements-textPrimary font-medium leading-5 text-sm">{artifact?.title}</div>
            <div className="w-full w-full text-bolt-elements-textSecondary text-xs mt-0.5">Click to open Workbench</div>
          </div>
        </button>
        <div className="bg-bolt-elements-artifacts-borderColor w-[1px]" />
        <AnimatePresence>
          {actions.length && (
            <motion.button
              initial={{ width: 0 }}
              animate={{ width: 'auto' }}
              exit={{ width: 0 }}
              transition={{ duration: 0.15, ease: cubicEasingFn }}
              className="bg-bolt-elements-artifacts-background hover:bg-bolt-elements-artifacts-backgroundHover"
              onClick={toggleActions}
            >
              <div className="p-4">
                <div className={showActions ? 'i-ph:caret-up-bold' : 'i-ph:caret-down-bold'}></div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showActions && actions.length > 0 && (
          <motion.div
            className="actions"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: '0px' }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-bolt-elements-artifacts-borderColor h-[1px]" />
            <div className="p-5 text-left bg-bolt-elements-actions-background">
              <ActionList actions={actions} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

interface ShellCodeBlockProps {
  classsName?: string;
  code: string;
}

function ShellCodeBlock({ classsName, code }: ShellCodeBlockProps) {
  return (
    <div
      className={classNames('text-xs', classsName)}
      dangerouslySetInnerHTML={{
        __html: shellHighlighter.codeToHtml(code, {
          lang: 'shell',
          theme: 'dark-plus',
        }),
      }}
    ></div>
  );
}

interface ActionListProps {
  actions: ActionState[];
}

const actionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ActionList = memo(({ actions }: ActionListProps) => {
  const [expandedActions, setExpandedActions] = useState<Set<number>>(new Set());

  const toggleExpanded = useCallback((index: number) => {
    setExpandedActions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <ul className="list-none space-y-2.5">
        {actions.map((action, index) => {
          const { status, type, content } = action;
          const isLast = index === actions.length - 1;
          const isExpanded = expandedActions.has(index);
          const hasResult = action.result && action.result.trim().length > 0;
          const isCompleted = status === 'complete' || status === 'failed' || status === 'aborted';

          return (
            <motion.li
              key={index}
              variants={actionVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.2,
                ease: cubicEasingFn,
              }}
            >
              <div 
                className={classNames(
                  "flex items-center gap-1.5 text-sm",
                  {
                    "cursor-pointer hover:bg-bolt-elements-artifacts-inlineCode-background/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors": hasResult && isCompleted
                  }
                )}
                onClick={hasResult && isCompleted ? () => toggleExpanded(index) : undefined}
              >
                <div className={classNames('text-lg', getIconColor(action.status))}>
                  {status === 'running' ? (
                    <div className="i-svg-spinners:90-ring-with-bg"></div>
                  ) : status === 'pending' ? (
                    <div className="i-ph:circle-duotone"></div>
                  ) : status === 'complete' ? (
                    <div className="i-ph:check"></div>
                  ) : status === 'failed' || status === 'aborted' ? (
                    <div className="i-ph:x"></div>
                  ) : null}
                </div>
                
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    {type === 'file' ? (
                      <div>
                        {status === 'complete' ? 'Created' : status === 'running' ? 'Creating' : 'Create'}{' '}
                        <code className="bg-bolt-elements-artifacts-inlineCode-background text-bolt-elements-artifacts-inlineCode-text px-1.5 py-1 rounded-md">
                          {action.filePath}
                        </code>
                      </div>
                    ) : type === 'shell' ? (
                      <div>
                        {status === 'complete' ? 'Executed' : status === 'running' ? 'Executing' : 'Execute'} command
                      </div>
                    ) : type === 'mcp-tool' ? (
                      <div>
                        {status === 'complete' ? 'Called' : status === 'running' ? 'Calling' : 'Call'} MCP tool{' '}
                        <code className="bg-bolt-elements-artifacts-inlineCode-background text-bolt-elements-artifacts-inlineCode-text px-1.5 py-1 rounded-md">
                          {(() => {
                            try {
                              const toolData = JSON.parse(content);
                              return toolData.tool || 'unknown';
                            } catch {
                              return 'unknown';
                            }
                          })()}
                        </code>
                      </div>
                    ) : null}
                  </div>
                  
                  {hasResult && isCompleted && (
                    <div className={classNames('text-xs transition-transform duration-200', {
                      'rotate-180': isExpanded
                    })}>
                      <div className="i-ph:caret-down"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Command display for shell commands */}
              {type === 'shell' && (
                <ShellCodeBlock
                  classsName={classNames('mt-1', {
                    'mb-3.5': !isLast && !isExpanded,
                  })}
                  code={content}
                />
              )}

              {/* Expandable result section */}
              <AnimatePresence>
                {isExpanded && hasResult && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: cubicEasingFn }}
                    className="overflow-hidden"
                  >
                    <div className={classNames('mt-2 border-l-2 border-bolt-elements-artifacts-borderColor pl-3', {
                      'mb-3.5': !isLast,
                    })}>
                      <div className="text-xs text-bolt-elements-textSecondary mb-1 font-medium">
                        {type === 'shell' ? 'Command Output:' : 
                         type === 'file' ? 'File Operation Result:' : 
                         type === 'mcp-tool' ? 'Tool Result:' : 'Result:'}
                      </div>
                      <div className="bg-bolt-elements-artifacts-inlineCode-background text-bolt-elements-artifacts-inlineCode-text p-3 rounded-md text-xs font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {action.result}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
});

function getIconColor(status: ActionState['status']) {
  switch (status) {
    case 'pending': {
      return 'text-bolt-elements-textTertiary';
    }
    case 'running': {
      return 'text-bolt-elements-loader-progress';
    }
    case 'complete': {
      return 'text-bolt-elements-icon-success';
    }
    case 'aborted': {
      return 'text-bolt-elements-textSecondary';
    }
    case 'failed': {
      return 'text-bolt-elements-icon-error';
    }
    default: {
      return undefined;
    }
  }
}
