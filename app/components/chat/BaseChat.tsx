import type { Message } from 'ai';
import React, { type RefCallback, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
import { IconButton } from '~/components/ui/IconButton';
import { Workbench } from '~/components/workbench/Workbench.client';
import { classNames } from '~/utils/classNames';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client';

import styles from './BaseChat.module.scss';

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
}

const EXAMPLE_PROMPTS = [
  { text: 'Create a task manager with real-time collaboration' },
  { text: 'Build a portfolio website with smooth animations' },
  { text: 'Design a modern dashboard with analytics charts' },
  { text: 'Make an interactive game with leaderboards' },
  { text: 'Build a landing page for my startup idea' },
];

const MOCK_MODELS = [
  { id: 'claude-4.5-haiku', name: 'Claude 4.5 Haiku', description: 'Fast & efficient', color: '#e86b47', active: true },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Most capable', color: '#3b82f6', active: false },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Versatile & creative', color: '#10b981', active: false },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Lightning fast', color: '#8b5cf6', active: false },
  { id: 'deepseek-coder', name: 'DeepSeek Coder V2', description: 'Open source', color: '#f59e0b', active: false },
];

const TEXTAREA_MIN_HEIGHT = 76;

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      enhancingPrompt = false,
      promptEnhanced = false,
      messages,
      input = '',
      sendMessage,
      handleInputChange,
      enhancePrompt,
      handleStop,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const [modelPickerOpen, setModelPickerOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState(MOCK_MODELS.find(m => m.active) || MOCK_MODELS[0]);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      if (modelPickerOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
        });
      }
    }, [modelPickerOpen]);

    return (
      <div
        ref={ref}
        className={classNames(
          styles.BaseChat,
          'relative flex h-full w-full overflow-hidden bg-bolt-elements-background-depth-1',
        )}
        data-chat-visible={showChat}
      >
        <ClientOnly>{() => <Menu />}</ClientOnly>
        <div ref={scrollRef} className="flex overflow-y-auto w-full h-full">
          <div className={classNames(styles.Chat, 'flex flex-col flex-grow min-w-[var(--chat-min-width)] h-full')}>
            <div
              className={classNames('px-6', {
                'h-full flex flex-col': chatStarted,
                'flex flex-col justify-center min-h-screen -mt-16': !chatStarted,
              })}
            >
              {!chatStarted && (
                <div id="intro" className="max-w-chat mx-auto px-4 mb-8">
                  <h1 className="text-5xl md:text-6xl text-center font-bold text-bolt-elements-textPrimary mb-4 tracking-tight">
                    Build anything, instantly
                  </h1>
                  <p className="mb-0 text-center text-bolt-elements-textSecondary text-lg">
                    Describe your vision and watch Otter create full-stack applications in real-time.
                  </p>
                </div>
              )}
              <ClientOnly>
                {() => {
                  return chatStarted ? (
                    <Messages
                      ref={messageRef}
                      className="flex flex-col w-full flex-1 max-w-chat px-4 pb-6 mx-auto z-1"
                      messages={messages}
                      isStreaming={isStreaming}
                    />
                  ) : null;
                }}
              </ClientOnly>
              <div
                className={classNames('relative w-full max-w-chat mx-auto z-prompt', {
                  'sticky bottom-0': chatStarted,
                })}
              >
                <div
                  className={classNames(
                    'bg-white/80 dark:bg-white/15 backdrop-blur-sm border border-gray-200 dark:border-white/30 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm',
                    {
                      'ring-2 ring-[#e86b47]/50': input.length > 0,
                    }
                  )}
                >
                  <textarea
                    ref={textareaRef}
                    className={`w-full pl-5 pt-5 pr-16 focus:outline-none resize-none text-md text-bolt-elements-textPrimary placeholder:text-bolt-elements-textTertiary dark:placeholder:text-white/50 bg-transparent`}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        if (event.shiftKey) {
                          return;
                        }

                        event.preventDefault();

                        sendMessage?.(event);
                      }
                    }}
                    value={input}
                    onChange={(event) => {
                      handleInputChange?.(event);
                    }}
                    style={{
                      minHeight: TEXTAREA_MIN_HEIGHT,
                      maxHeight: TEXTAREA_MAX_HEIGHT,
                    }}
                    placeholder="Describe what you want to build..."
                    translate="no"
                  />
                  <ClientOnly>
                    {() => (
                      <SendButton
                        show={true}
                        isStreaming={isStreaming}
                        onClick={(event) => {
                          if (isStreaming) {
                            handleStop?.();
                            return;
                          }

                          sendMessage?.(event);
                        }}
                      />
                    )}
                  </ClientOnly>
                  <div className="flex justify-between items-center text-sm p-5 pt-2">
                    <div className="flex gap-1 items-center">
                      <IconButton
                        title="Enhance prompt"
                        disabled={input.length === 0 || enhancingPrompt}
                        className={classNames('transition-all duration-200', {
                          'opacity-100!': enhancingPrompt,
                          'text-[#e86b47]! pr-1.5 enabled:hover:bg-[#e86b47]/10!':
                            promptEnhanced,
                        })}
                        onClick={() => enhancePrompt?.()}
                      >
                        {enhancingPrompt ? (
                          <>
                            <div className="i-svg-spinners:90-ring-with-bg text-[#e86b47] text-xl"></div>
                            <div className="ml-1.5 text-bolt-elements-textSecondary">Enhancing...</div>
                          </>
                        ) : (
                          <>
                            <div className="i-bolt:stars text-xl"></div>
                            {promptEnhanced && <div className="ml-1.5 text-[#e86b47]">Enhanced</div>}
                          </>
                        )}
                      </IconButton>
                    </div>
                    
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <button
                                ref={buttonRef}
                                onClick={() => setModelPickerOpen(!modelPickerOpen)}
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 hover:border-[#e86b47]/50 hover:bg-[#e86b47]/5 transition-all duration-200 group"
                              >
                                <div 
                                  className="w-2 h-2 rounded-full shadow-sm" 
                                  style={{ 
                                    backgroundColor: selectedModel.color,
                                    boxShadow: `0 0 8px ${selectedModel.color}40`
                                  }}
                                ></div>
                                <span className="text-xs font-medium text-bolt-elements-textTertiary dark:text-white/60 group-hover:text-[#e86b47] transition-colors">
                                  {selectedModel.name}
                                </span>
                                <svg 
                                  className={`w-3.5 h-3.5 text-bolt-elements-textTertiary dark:text-white/40 group-hover:text-[#e86b47] transition-all duration-200 ${modelPickerOpen ? 'rotate-180' : ''}`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              
                              {modelPickerOpen && typeof document !== 'undefined' && createPortal(
                                <>
                                  <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setModelPickerOpen(false)}
                                  ></div>
                                  <div 
                                    className="fixed bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-2xl overflow-hidden min-w-[280px] z-50 backdrop-blur-xl"
                                    style={{
                                      top: `${dropdownPosition.top - 12}px`,
                                      left: `${dropdownPosition.left}px`,
                                      transform: 'translateY(-100%)',
                                    }}
                                  >
                                    <div className="px-3 py-2 border-b border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Select Model</div>
                                    </div>
                                    <div className="py-1 bg-white dark:bg-neutral-900">
                                      {MOCK_MODELS.map((model) => (
                                        <button
                                          key={model.id}
                                          onClick={() => {
                                            setSelectedModel(model);
                                            setModelPickerOpen(false);
                                          }}
                                          className={`w-full text-left px-3 py-2.5 transition-all duration-150 flex items-start gap-3 group ${
                                            selectedModel.id === model.id 
                                              ? 'bg-[#e86b47]/10 dark:bg-[#e86b47]/15' 
                                              : 'hover:bg-gray-50 dark:hover:bg-neutral-800'
                                          }`}
                                        >
                                          <div 
                                            className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ring-2" 
                                            style={{ 
                                              backgroundColor: model.color,
                                              ringColor: `${model.color}30`,
                                              boxShadow: selectedModel.id === model.id ? `0 0 12px ${model.color}60` : 'none'
                                            }}
                                          ></div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                              <div className={`text-sm font-semibold ${
                                                selectedModel.id === model.id 
                                                  ? 'text-[#e86b47]' 
                                                  : 'text-gray-900 dark:text-white group-hover:text-[#e86b47]'
                                              } transition-colors`}>
                                                {model.name}
                                              </div>
                                              {selectedModel.id === model.id && (
                                                <svg className="w-4 h-4 text-[#e86b47]" fill="currentColor" viewBox="0 0 20 20">
                                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                              )}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                              {model.description}
                                            </div>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </>,
                                document.body
                              )}
                            </div>
                      
                      {input.length > 3 ? (
                        <div className="text-xs text-bolt-elements-textTertiary dark:text-white/40">
                          <kbd className="kdb px-1.5 py-0.5 bg-white/20 dark:bg-white/10 rounded">Shift</kbd> + <kbd className="kdb px-1.5 py-0.5 bg-white/20 dark:bg-white/10 rounded">Return</kbd> for new line
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="bg-bolt-elements-background-depth-1 pb-6">{/* Ghost Element */}</div>
              </div>
            </div>
            {!chatStarted && (
              <div id="examples" className="relative w-full max-w-xl mx-auto mt-8 flex justify-center">
                <div className="flex flex-col space-y-2 [mask-image:linear-gradient(to_bottom,black_0%,transparent_180%)] hover:[mask-image:none]">
                  {EXAMPLE_PROMPTS.map((examplePrompt, index) => {
                    return (
                      <button
                        key={index}
                        onClick={(event) => {
                          sendMessage?.(event, examplePrompt.text);
                        }}
                        className="group flex items-center w-full gap-2 justify-center bg-transparent text-bolt-elements-textTertiary hover:text-[#e86b47] transition-all duration-200"
                      >
                        {examplePrompt.text}
                        <div className="i-ph:arrow-bend-down-left group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <ClientOnly>{() => <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />}</ClientOnly>
        </div>
      </div>
    );
  },
);
