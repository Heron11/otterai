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
import type { UploadedImage } from './ImageUploadButton';
import { convertToWebContainerFormat, fetchGithubRepoFiles, generateFallbackFiles } from '~/lib/utils/github.client';
import { webcontainer } from '~/lib/webcontainer';

const toastAnimation = cssTransition({
  enter: 'animated fadeInRight',
  exit: 'animated fadeOutRight',
});

const logger = createScopedLogger('Chat');

interface ChatWrapperProps {
  templateData?: any;
}

export function Chat({ templateData }: ChatWrapperProps) {
  renderLogger.trace('Chat');

  const { ready, initialMessages, storeMessageHistory } = useChatHistory();

  return (
    <>
      {ready && (
        <ChatImpl 
          initialMessages={initialMessages} 
          storeMessageHistory={storeMessageHistory}
          templateData={templateData} 
        />
      )}
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
  templateData?: any;
}

export const ChatImpl = memo(({ initialMessages, storeMessageHistory, templateData }: ChatProps) => {
  useShortcuts();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isAuthenticated, isLoaded } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const [chatStarted, setChatStarted] = useState(initialMessages.length > 0);
  const [templateInitialized, setTemplateInitialized] = useState(false);
  const [isInitializingTemplate, setIsInitializingTemplate] = useState(false);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { showChat } = useStore(chatStore);

  const [animationScope, animate] = useAnimate();

  // Check for message parameter from landing page (prevent infinite URL updates)
  useEffect(() => {
    const messageParam = searchParams.get('message');
    if (messageParam && !pendingMessage) {
      setPendingMessage(messageParam);
      // Remove the message parameter from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('message');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams.get('message'), pendingMessage]); // More specific dependency

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

  // Update chat started state when messages change
  useEffect(() => {
    if (messages.length > 0 && !chatStarted) {
      setChatStarted(true);
      chatStore.setKey('started', true);
    }
  }, [messages.length, chatStarted]);

  // Cleanup timeout on unmount and clear session flags
  useEffect(() => {
    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      // Clear session storage when component unmounts to allow fresh initialization next time
      if (templateData?.templateId) {
        sessionStorage.removeItem(`template-init-${templateData.templateId}`);
        sessionStorage.removeItem(`template-msg-sent-${templateData.templateId}`);
        sessionStorage.removeItem(`template-toast-${templateData.templateId}`);
        sessionStorage.removeItem(`template-success-${templateData.templateId}`);
      }
    };
  }, [templateData?.templateId]);

  useEffect(() => {
    parseMessages(messages, isLoading);

    if (messages.length > initialMessages.length) {
      storeMessageHistory(messages).catch((error) => logger.error(error));
    }
  }, [messages, isLoading, parseMessages, storeMessageHistory, initialMessages.length]);

  // Handle template initialization with client-side file fetching
  useEffect(() => {
    // Early return conditions to prevent infinite loops
    if (
      !templateData?.hasTemplate ||
      !templateData.templateId ||
      !append ||
      templateInitialized ||
      isInitializingTemplate ||
      initialMessages.length > 0
    ) {
      return;
    }

    // Check if already processed this template
    const templateKey = `template-init-${templateData.templateId}`;
    if (sessionStorage.getItem(templateKey)) {
      console.log('[Template Init] Template already processed:', templateData.templateId);
      setTemplateInitialized(true);
      return;
    }

    console.log('[Template Init] Starting template initialization:', templateData.templateId);
    setIsInitializingTemplate(true);

    const initializeTemplate = async () => {
      try {
        // Add timeout protection
        const timeoutPromise = new Promise((_, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Template initialization timeout'));
          }, 30000); // 30 second timeout

          initializationTimeoutRef.current = timeout;
        });

        const initPromise = (async () => {
          // Send initial "Hello" message immediately to transition UI
          const sessionKey = `template-msg-sent-${templateData.templateId}`;
          if (!sessionStorage.getItem(sessionKey)) {
            console.log('[Template Init] Sending initial template message');
            sessionStorage.setItem(sessionKey, 'true');

            // Send a simple message to start the chat and transition the UI
            append({
              role: 'user',
              content: 'Hello'
            });

            // Set chat started after sending the message
            setTimeout(() => {
              setChatStarted(true);
            }, 100);
          } else {
            setChatStarted(true);
          }

          // Show workbench immediately with loading state
          workbenchStore.setShowWorkbench(true);
          workbenchStore.setIsLoadingFiles(true);

          // Show loading toast
          const toastKey = `template-toast-${templateData.templateId}`;
          if (!sessionStorage.getItem(toastKey)) {
            toast.info(`Loading template files: ${templateData.template.name}...`);
            sessionStorage.setItem(toastKey, 'true');
          }

          // Fetch template files from GitHub (client-side)
          let templateFiles;
          try {
            console.log('Fetching template files from:', templateData.template.githubUrl);
            templateFiles = await fetchGithubRepoFiles(templateData.template.githubUrl);
            
            if (!templateFiles || templateFiles.length === 0) {
              throw new Error('No files fetched from repository');
            }
            
            console.log('Successfully fetched', templateFiles.length, 'files from GitHub');
          } catch (error) {
            console.warn('Failed to fetch from GitHub, using placeholder files:', error);
            templateFiles = generateFallbackFiles(templateData.template);
          }

          // Convert GitHub files to WebContainer format
          const fileTree = convertToWebContainerFormat(templateFiles);

          // Wait for WebContainer to be ready
          const container = await webcontainer;

          // Mount the file system
          await container.mount(fileTree);

          // Clear loading state
          workbenchStore.setIsLoadingFiles(false);

          // Mark as initialized
          setTemplateInitialized(true);

          // Show success toast
          const successKey = `template-success-${templateData.templateId}`;
          if (!sessionStorage.getItem(successKey)) {
            toast.success(`Template "${templateData.template.name}" loaded successfully!`);
            sessionStorage.setItem(successKey, 'true');
          }
        })();

        // Race between initialization and timeout
        await Promise.race([initPromise, timeoutPromise]);

      } catch (error) {
        console.error('Failed to initialize template:', error);
        toast.error('Failed to load template. You can still start from scratch.');
        setTemplateInitialized(true); // Mark as attempted to prevent retries
        workbenchStore.setIsLoadingFiles(false); // Clear loading state on error
      } finally {
        setIsInitializingTemplate(false);
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current);
          initializationTimeoutRef.current = null;
        }
      }
    };

    // Mark as processing and run initialization
    sessionStorage.setItem(templateKey, 'true');
    initializeTemplate();

  }, [templateData?.templateId]); // Only depend on templateId to prevent re-runs

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

  // Cleanup timeout on unmount and clear session flags
  useEffect(() => {
    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      // Clear session storage when component unmounts to allow fresh initialization next time
      if (templateData?.templateId) {
        sessionStorage.removeItem(`template-init-${templateData.templateId}`);
        sessionStorage.removeItem(`template-msg-sent-${templateData.templateId}`);
      }
    };
  }, [templateData?.templateId]);


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
      />
      
      <SignInModal 
        isOpen={showSignInModal} 
        onClose={handleCloseSignInModal} 
      />
    </>
  );
});
