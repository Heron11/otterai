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
import { syncProjectToServer } from '~/lib/services/project-sync-v2.client';
import { useSearchParams } from '@remix-run/react';
import type { UploadedImage } from './ImageUploadButton';

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
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const [chatStarted, setChatStarted] = useState(initialMessages.length > 0);
  const [projectName, setProjectName] = useState<string | null>(null);

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

  // Initialize chat state based on context
  useEffect(() => {
    async function handleChatInitialization() {
      const { getCurrentProject } = await import('~/lib/stores/project-context');
      const projectContext = getCurrentProject();
      
      // Only act if this is truly a fresh chat (no initial messages, not loading from history)
      if (initialMessages.length === 0) {
        if (projectContext) {
          // Project loaded - set chat as started immediately
          setChatStarted(true);
          chatStore.setKey('started', true);
          setProjectName(projectContext.projectName);
        } else {
          // No project context - clear workbench for a fresh start
          workbenchStore.clearForNewChat();
        }
      }
    }

    handleChatInitialization();
  }, [initialMessages.length]);

  useEffect(() => {
    chatStore.setKey('started', initialMessages.length > 0);
  }, [initialMessages.length]);

  // Update chatStarted when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setChatStarted(true);
      chatStore.setKey('started', true);
    }
  }, [messages.length]);

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

  const handleImagesSelected = useCallback((images: UploadedImage[]) => {
    setUploadedImages(prev => [...prev, ...images]);
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

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

    // Build message content - support both text and multimodal
    let messageContent: any = _input;
    
    if (uploadedImages.length > 0) {
      // Convert to multimodal format for Claude API
      const contentParts: any[] = [];
      
      // Add images first (Claude expects image-then-text structure)
      uploadedImages.forEach(img => {
        contentParts.push({
          type: 'image',
          image: `data:${img.mimeType};base64,${img.data}`, // Full data URL format
        });
      });
      
      // Add text with file modifications if any
      const textContent = fileModifications 
        ? `${fileModificationsToHTML(fileModifications)}\n\n${_input}`
        : _input;
      
      contentParts.push({
        type: 'text',
        text: textContent,
      });
      
      messageContent = contentParts;
      
      if (fileModifications !== undefined) {
        workbenchStore.resetAllFileModifications();
      }
    } else if (fileModifications !== undefined) {
      const diff = fileModificationsToHTML(fileModifications);
      messageContent = `${diff}\n\n${_input}`;
      workbenchStore.resetAllFileModifications();
    }

    append({ role: 'user', content: messageContent });

    // Clear images and input after sending
    setUploadedImages([]);
    setInput('');
    resetEnhancer();
    textareaRef.current?.blur();
  }, [input, isLoading, isLoaded, isAuthenticated, append, setInput, resetEnhancer, runAnimation, uploadedImages]);

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
        uploadedImages={uploadedImages}
        onImagesSelected={handleImagesSelected}
        onRemoveImage={handleRemoveImage}
        projectName={projectName}
      />
      
      <SignInModal 
        isOpen={showSignInModal} 
        onClose={handleCloseSignInModal} 
      />
    </>
  );
});
