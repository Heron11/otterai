import { useStore } from '@nanostores/react';
import type { Message } from 'ai';
import { useChat } from 'ai/react';
import { useAnimate } from 'framer-motion';
import { memo, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { cssTransition, toast, ToastContainer } from 'react-toastify';
import { useMessageParser, usePromptEnhancer, useShortcuts, useSnapScroll } from '~/lib/hooks';
import { useChatHistory, chatId } from '~/lib/persistence';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';
import { fileModificationsToHTML } from '~/utils/diff';
import { cubicEasingFn } from '~/utils/easings';
import { createScopedLogger, renderLogger } from '~/utils/logger';
import { useAuth } from '~/lib/hooks/useAuth';
import { SignInModal } from '~/components/auth/SignInModal';
import { BaseChat } from './BaseChat';
import { syncProjectToServer } from '~/lib/services/project-sync.client';
import { useSearchParams } from '@remix-run/react';

const toastAnimation = cssTransition({
  enter: 'animated fadeInRight',
  exit: 'animated fadeOutRight',
});

const logger = createScopedLogger('Chat');

export function Chat() {
  renderLogger.trace('Chat');

  const { ready, initialMessages, storeMessageHistory } = useChatHistory();

  return (
    <>
      {ready && <ChatImpl initialMessages={initialMessages} storeMessageHistory={storeMessageHistory} />}
      <ToastContainer
        closeButton={({ closeToast }) => {
          return (
            <button className="Toastify__close-button" onClick={closeToast}>
              <div className="i-ph:x text-lg" />
            </button>
          );
        }}
        icon={({ type }) => {
          /**
           * @todo Handle more types if we need them. This may require extra color palettes.
           */
          switch (type) {
            case 'success': {
              return <div className="i-ph:check-bold text-[#4ade80] text-2xl" />;
            }
            case 'error': {
              return <div className="i-ph:warning-circle-bold text-[#ef4444] text-2xl" />;
            }
          }

          return undefined;
        }}
        position="bottom-right"
        pauseOnFocusLoss
        transition={toastAnimation}
      />
    </>
  );
}

interface ChatProps {
  initialMessages: Message[];
  storeMessageHistory: (messages: Message[]) => Promise<void>;
}

export const ChatImpl = memo(({ initialMessages, storeMessageHistory }: ChatProps) => {
  useShortcuts();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isAuthenticated, isLoaded } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const [chatStarted, setChatStarted] = useState(initialMessages.length > 0);

  const { showChat } = useStore(chatStore);

  const [animationScope, animate] = useAnimate();

  // Check for message parameter from landing page
  useEffect(() => {
    const messageParam = searchParams.get('message');
    if (messageParam) {
      setPendingMessage(messageParam);
      // Remove the message parameter from URL
      searchParams.delete('message');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Reset sign in modal when authentication state changes
  useEffect(() => {
    if (isAuthenticated && showSignInModal) {
      setShowSignInModal(false);
    }
  }, [isAuthenticated, showSignInModal]);

  // Listen for custom events to show sign in modal
  useEffect(() => {
    const handleShowSignInModal = () => {
      setShowSignInModal(true);
    };

    window.addEventListener('showSignInModal', handleShowSignInModal);
    
    return () => {
      window.removeEventListener('showSignInModal', handleShowSignInModal);
    };
  }, []);

  const { messages, isLoading, input, handleInputChange, setInput, stop, append } = useChat({
    api: '/api/chat',
    onError: async (error) => {
      logger.error('Request failed\n\n', error);
      
      // Check if it's a credits error (402 Payment Required)
      if (error instanceof Error && error.message.includes('402')) {
        toast.error('You have run out of credits. Please upgrade your plan to continue.');
      } else {
        toast.error('There was an error processing your request');
      }
    },
    onFinish: async () => {
      logger.debug('Finished streaming');
      
      // Sync to server for authenticated users
      if (isAuthenticated) {
        // Wait a moment for all file writes to complete
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const files = workbenchStore.files.get();
        const currentChatId = chatId.get();
        const projectName = workbenchStore.firstArtifact?.title || 'Untitled Project';
        
        // Only sync if we have files and a chat ID
        if (currentChatId && Object.keys(files).length > 0) {
          syncProjectToServer({
            chatId: currentChatId,
            projectName,
            files,
          }).catch((error) => {
            logger.error('Background project sync failed:', error);
            // Don't show error to user - still saved locally in IndexedDB
          });
        }
      }
    },
    initialMessages,
  });

  const { enhancingPrompt, promptEnhanced, enhancePrompt, resetEnhancer } = usePromptEnhancer();
  const { parsedMessages, parseMessages } = useMessageParser();

  const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

  useEffect(() => {
    chatStore.setKey('started', initialMessages.length > 0);
  }, []);

  useEffect(() => {
    parseMessages(messages, isLoading);

    if (messages.length > initialMessages.length) {
      storeMessageHistory(messages).catch((error) => toast.error(error.message));
    }
  }, [messages, isLoading, parseMessages]);

  const scrollTextArea = useCallback(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, []);

  const abort = useCallback(() => {
    stop();
    chatStore.setKey('aborted', true);
    workbenchStore.abortAllActions();
  }, [stop]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = 'auto';

      const scrollHeight = textarea.scrollHeight;

      textarea.style.height = `${Math.min(scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
      textarea.style.overflowY = scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
    }
  }, [input, textareaRef]);

  const runAnimation = useCallback(async () => {
    if (chatStarted) {
      return;
    }

    await Promise.all([
      animate('#examples', { opacity: 0, display: 'none' }, { duration: 0.1 }),
      animate('#intro', { opacity: 0, flex: 1 }, { duration: 0.2, ease: cubicEasingFn }),
    ]);

    chatStore.setKey('started', true);

    setChatStarted(true);
  }, [chatStarted, animate]);

  // Handle pending message from landing page
  useEffect(() => {
    if (pendingMessage && isLoaded) {
      if (isAuthenticated) {
        // User is authenticated, send the message automatically
        setInput(pendingMessage);
        setPendingMessage(null);
        // Send after a brief delay to ensure input is set
        setTimeout(() => {
          sendMessage({} as React.UIEvent, pendingMessage);
        }, 100);
      } else {
        // User is not authenticated, set input and show sign-in modal
        setInput(pendingMessage);
        setPendingMessage(null);
        setShowSignInModal(true);
      }
    }
  }, [pendingMessage, isLoaded, isAuthenticated]);

  const sendMessage = useCallback(async (_event: React.UIEvent, messageInput?: string) => {
    const _input = messageInput || input;

    if (_input.length === 0 || isLoading) {
      return;
    }

    // Check if user is authenticated before sending message
    if (!isLoaded || !isAuthenticated) {
      setShowSignInModal(true);
      return;
    }

    /**
     * @note (delm) Usually saving files shouldn't take long but it may take longer if there
     * many unsaved files. In that case we need to block user input and show an indicator
     * of some kind so the user is aware that something is happening. But I consider the
     * happy case to be no unsaved files and I would expect users to save their changes
     * before they send another message.
     */
    await workbenchStore.saveAllFiles();

    const fileModifications = workbenchStore.getFileModifcations();

    chatStore.setKey('aborted', false);

    runAnimation();

    if (fileModifications !== undefined) {
      const diff = fileModificationsToHTML(fileModifications);

      /**
       * If we have file modifications we append a new user message manually since we have to prefix
       * the user input with the file modifications and we don't want the new user input to appear
       * in the prompt. Using `append` is almost the same as `handleSubmit` except that we have to
       * manually reset the input and we'd have to manually pass in file attachments. However, those
       * aren't relevant here.
       */
      append({ role: 'user', content: `${diff}\n\n${_input}` });

      /**
       * After sending a new message we reset all modifications since the model
       * should now be aware of all the changes.
       */
      workbenchStore.resetAllFileModifications();
    } else {
      append({ role: 'user', content: _input });
    }

    setInput('');

    resetEnhancer();

    textareaRef.current?.blur();
  }, [input, isLoading, isLoaded, isAuthenticated, append, setInput, resetEnhancer, runAnimation]);

  const [messageRef, scrollRef] = useSnapScroll();

  // Memoize the processed messages to avoid recreating the array on every render
  const processedMessages = useMemo(() => {
    return messages.map((message, i) => {
      if (message.role === 'user') {
        return message;
      }

      return {
        ...message,
        content: parsedMessages[i] || '',
      };
    });
  }, [messages, parsedMessages]);

  // Memoize enhancePrompt callback
  const handleEnhancePrompt = useCallback(() => {
    enhancePrompt(input, (enhancedInput) => {
      setInput(enhancedInput);
      scrollTextArea();
    });
  }, [enhancePrompt, input, setInput, scrollTextArea]);

  const handleCloseSignInModal = useCallback(() => {
    setShowSignInModal(false);
  }, []);

  return (
    <>
      <BaseChat
        ref={animationScope}
        textareaRef={textareaRef}
        input={input}
        setInput={setInput}
        showChat={showChat}
        chatStarted={chatStarted}
        isStreaming={isLoading}
        enhancingPrompt={enhancingPrompt}
        promptEnhanced={promptEnhanced}
        sendMessage={sendMessage}
        messageRef={messageRef}
        scrollRef={scrollRef}
        handleInputChange={handleInputChange}
        handleStop={abort}
        messages={processedMessages}
        enhancePrompt={handleEnhancePrompt}
      />
      
      <SignInModal 
        isOpen={showSignInModal} 
        onClose={handleCloseSignInModal} 
      />
    </>
  );
});
