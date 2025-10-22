import type { Message } from 'ai';
import React, { type RefCallback, useState, useRef, useEffect, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
import { IconButton } from '~/components/ui/IconButton';
import { Workbench } from '~/components/workbench/Workbench.client';
import { classNames } from '~/utils/classNames';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client';
import { VoiceButton } from './VoiceButton';
import { useVoiceInput } from '~/lib/hooks/useVoiceInput';

import styles from './BaseChat.module.scss';

// Move constants outside component to prevent recreation on every render
const PROMPT_EXAMPLES = [
  {
    title: "E-commerce Store",
    prompt: "Create a stunning, modern e-commerce store with a focus on visual appeal and user experience. Include: Hero section with beautiful product showcase, clean product grid with hover effects and smooth animations, elegant product detail pages with image galleries, minimalist shopping cart with slide-out animations, streamlined checkout flow with progress indicators, and a cohesive color scheme with premium typography. Use subtle gradients, glassmorphism effects, and micro-interactions to create a luxury shopping experience.",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )
  },
  {
    title: "Portfolio Website",
    prompt: "Design a breathtaking portfolio website that showcases work in the most elegant way possible. Include: Stunning hero section with animated text and background effects, immersive project gallery with smooth transitions and hover states, elegant about section with personal story and skills visualization, beautiful contact form with floating labels and smooth validation, dark/light mode toggle with seamless transitions, and a cohesive design system with premium typography and spacing. Focus on creating an emotional connection through beautiful visuals and smooth animations.",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    title: "SaaS Dashboard",
    prompt: "Build a sophisticated SaaS dashboard that feels premium and intuitive. Include: Clean, data-rich dashboard with beautiful charts and visualizations, elegant sidebar navigation with smooth transitions, modern card-based layout with subtle shadows and hover effects, comprehensive user management with sleek tables and action buttons, integrated analytics with animated progress bars and trend indicators, and a cohesive design system with consistent spacing and typography. Focus on creating a professional, trustworthy interface that users will love to interact with daily.",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    title: "Blog Platform",
    prompt: "Create a visually stunning blog platform that makes reading a pleasure. Include: Beautiful hero section with featured articles and smooth parallax effects, elegant article cards with hover animations and reading time indicators, immersive article reading experience with perfect typography and spacing, clean comment system with threaded replies and smooth interactions, author profiles with social links and bio sections, and a sophisticated search and filtering system. Focus on creating a reading experience that's both beautiful and functional, with attention to typography, spacing, and visual hierarchy.",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    )
  },
  {
    title: "Task Manager",
    prompt: "Design a beautiful, intuitive task management app that makes productivity feel effortless. Include: Clean, drag-and-drop kanban boards with smooth animations, elegant task cards with priority indicators and due dates, beautiful project overview with progress visualizations and team avatars, intuitive task creation with smart suggestions and auto-complete, collaborative features with real-time updates and notifications, and a cohesive design system with calming colors and smooth micro-interactions. Focus on creating a stress-free, enjoyable experience that motivates users to stay organized and productive.",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  }
];

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
  setInput?: (value: string) => void;
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

type Model = {
  id: string;
  name: string;
  description: string;
  color: string;
  active: boolean;
};

const MOCK_MODELS: Model[] = [
  { id: 'claude-4.5-haiku', name: 'Claude 4.5 Haiku', description: 'Fast & efficient', color: '#e86b47', active: true },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Most capable', color: '#3b82f6', active: false },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Versatile & creative', color: '#10b981', active: false },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Lightning fast', color: '#8b5cf6', active: false },
  { id: 'deepseek-coder', name: 'DeepSeek Coder V2', description: 'Open source', color: '#f59e0b', active: false },
];

const TEXTAREA_MIN_HEIGHT = 76;

// Extract ModelPicker as a separate memoized component
const ModelPicker = memo(({ 
  isOpen, 
  selectedModel, 
  buttonRef, 
  dropdownPosition, 
  onToggle, 
  onSelect, 
  onClose 
}: {
  isOpen: boolean;
  selectedModel: Model;
  buttonRef: React.RefObject<HTMLButtonElement>;
  dropdownPosition: { top: number; left: number; width: number };
  onToggle: () => void;
  onSelect: (model: Model) => void;
  onClose: () => void;
}) => {
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="flex items-center gap-1.5 md:gap-2.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 hover:border-[#e86b47]/50 hover:bg-[#e86b47]/5 transition-all duration-200 group"
      >
        <div 
          className="w-2 h-2 rounded-full shadow-sm" 
          style={{ 
            backgroundColor: selectedModel.color,
            boxShadow: `0 0 8px ${selectedModel.color}40`
          }}
        ></div>
        <span className="text-xs font-medium text-bolt-elements-textTertiary dark:text-white/60 group-hover:text-[#e86b47] transition-colors hidden sm:inline">
          {selectedModel.name}
        </span>
        <svg 
          className={`w-3.5 h-3.5 text-bolt-elements-textTertiary dark:text-white/40 group-hover:text-[#e86b47] transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
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
                    onSelect(model);
                    onClose();
                  }}
                  className={`w-full text-left px-3 py-2.5 transition-all duration-150 flex items-start gap-3 group ${
                    selectedModel.id === model.id 
                      ? 'bg-[#e86b47]/10 dark:bg-[#e86b47]/15' 
                      : 'hover:bg-gray-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" 
                    style={{ 
                      backgroundColor: model.color,
                      boxShadow: selectedModel.id === model.id ? `0 0 12px ${model.color}60` : `0 0 0 2px ${model.color}30`
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
  );
});

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
      setInput,
      sendMessage,
      handleInputChange,
      enhancePrompt,
      handleStop,
    },
    ref,
  ) => {
    const location = useLocation();
    const isBuildPage = location.pathname === '/';
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

    // Memoize callbacks
    const toggleModelPicker = useCallback(() => {
      setModelPickerOpen(prev => !prev);
    }, []);

    const closeModelPicker = useCallback(() => {
      setModelPickerOpen(false);
    }, []);

    const handleModelSelect = useCallback((model: Model) => {
      setSelectedModel(model);
    }, []);

    // Voice input functionality
    const { isRecording, isSupported, toggleRecording } = useVoiceInput({
      onTranscript: (text) => {
        setInput?.(text);
      },
      language: 'en-US',
    });

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
              {!chatStarted && isBuildPage && (
                <div id="intro" className="max-w-chat mx-auto px-4 mb-6 md:mb-8">
                  <h1 className="text-3xl sm:text-4xl md:text-6xl text-center font-bold text-bolt-elements-textPrimary mb-3 md:mb-4 tracking-tight">
                    Build anything, instantly
                  </h1>
                  <p className="mb-0 text-center text-bolt-elements-textSecondary text-base md:text-lg">
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
                    'bg-white/80 dark:bg-white/15 backdrop-blur-sm border border-gray-200 dark:border-white/30 rounded-xl md:rounded-2xl overflow-hidden transition-all duration-200 shadow-sm',
                    {
                      'ring-2 ring-[#e86b47]/50': input.length > 0,
                    }
                  )}
                >
                  <textarea
                    ref={textareaRef}
                    className={`w-full pl-4 md:pl-5 pt-4 md:pt-5 pr-14 md:pr-16 focus:outline-none resize-none text-sm md:text-md text-bolt-elements-textPrimary placeholder:text-bolt-elements-textTertiary dark:placeholder:text-white/50 bg-transparent`}
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
                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="absolute bottom-full left-4 mb-2 px-3 py-1.5 bg-red-500 text-white text-xs rounded-full shadow-lg animate-pulse flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      Recording... Click mic to stop
                    </div>
                  )}
                  
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
                  <div className="flex justify-between items-center text-sm p-3 md:p-5 pt-2">
                    <div className="flex gap-2 items-center">
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
                      
                      {/* Voice Input Button */}
                      <VoiceButton
                        isRecording={isRecording}
                        isSupported={isSupported}
                        onClick={toggleRecording}
                        disabled={isStreaming}
                      />
                    </div>
                    
                          <div className="flex items-center gap-3">
                            <ModelPicker
                              isOpen={modelPickerOpen}
                              selectedModel={selectedModel}
                              buttonRef={buttonRef}
                              dropdownPosition={dropdownPosition}
                              onToggle={toggleModelPicker}
                              onSelect={handleModelSelect}
                              onClose={closeModelPicker}
                            />
                      
                      {input.length > 3 ? (
                        <div className="text-xs text-bolt-elements-textTertiary dark:text-white/40">
                          <kbd className="kdb px-1.5 py-0.5 bg-white/20 dark:bg-white/10 rounded">Shift</kbd> + <kbd className="kdb px-1.5 py-0.5 bg-white/20 dark:bg-white/10 rounded">Return</kbd> for new line
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                
                {/* Prompt Examples */}
                {!chatStarted && isBuildPage && (
                  <div id="examples" className="mt-6 md:mt-8 mb-4 md:mb-6">
                    <div className="text-center mb-3 md:mb-4">
                      <p className="text-xs md:text-sm text-bolt-elements-textSecondary dark:text-white/70">
                        Not sure where to start? Try one of these:
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3 justify-center max-w-4xl mx-auto">
                      {PROMPT_EXAMPLES.map((example, index) => (
                        <button
                          key={index}
                          onClick={() => setInput?.(example.prompt)}
                          className="flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 bg-white/80 dark:bg-white/15 border border-gray-200 dark:border-white/30 hover:border-[#e86b47]/50 dark:hover:border-[#e86b47]/50 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#e86b47]/20 group backdrop-blur-sm hover:bg-[#e86b47]/5 dark:hover:bg-[#e86b47]/10"
                        >
                          <div className="text-[#e86b47]/80 dark:text-[#e86b47]/70 group-hover:text-[#e86b47] transition-colors duration-300 group-hover:scale-110">
                            {example.icon}
                          </div>
                          <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-white/80 group-hover:text-[#e86b47] transition-colors duration-300">
                            {example.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="bg-bolt-elements-background-depth-1 pb-6">{/* Ghost Element */}</div>
              </div>
                  </div>
          </div>
          <ClientOnly>{() => <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />}</ClientOnly>
        </div>
      </div>
    );
  },
);
