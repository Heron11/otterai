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
import { fetchLocalTemplateFiles } from '~/lib/utils/github.client';
import { webcontainer } from '~/lib/webcontainer';
import { WORK_DIR } from '~/utils/constants';
import { normalizeToRelativePath } from '~/lib/utils/path';

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
  const [projectFilesLoaded, setProjectFilesLoaded] = useState(false);
  const [isLoadingProjectFiles, setIsLoadingProjectFiles] = useState(false);
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
    body: {
      chatId: chatId.get(),
      uploadedImages,
      // Pass current files to the API for AI context
      files: useMemo(() => {
        const files = workbenchStore.files.get();
        const fileContents: Record<string, string> = {};
        for (const [path, dirent] of Object.entries(files)) {
          if (dirent?.type === 'file' && !dirent.isBinary) {
            fileContents[path] = dirent.content;
          }
        }
        return fileContents;
      }, [workbenchStore.files.get()]),
    },
    onError: async (error) => {
      logger.error('Request failed\n\n', error);
      
      // Check if it's a credits error (402 Payment Required)
      if (error instanceof Error && error.message.includes('402')) {
        toast.error('You have run out of credits. Please upgrade your plan to continue.');
      } else {
        toast.error('There was an error processing your request');
      }
    },
    onFinish: async (message) => {
      logger.debug('Finished streaming');
      
      // CRITICAL: Wait for actions to complete, then send results back to AI
      try {
        const messageId = message.id;
        
        // Wait a moment for actions to be parsed and queued
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if there are any actions for this message
        const artifact = workbenchStore.artifacts.get()[messageId];
        if (artifact && artifact.runner) {
          const actions = artifact.runner.actions.get();
          const actionEntries = Object.entries(actions);
          
          if (actionEntries.length > 0) {
            console.log('[AI Tool Results] Found', actionEntries.length, 'actions, waiting for completion...');
            
            // Wait for all actions to complete (with timeout)
            const maxWaitTime = 30000; // 30 seconds max
            const startTime = Date.now();
            
            let allCompleted = false;
            while (!allCompleted && (Date.now() - startTime) < maxWaitTime) {
              const currentActions = artifact.runner.actions.get();
              const actionStatuses = Object.values(currentActions);
              
              allCompleted = actionStatuses.every(action => 
                action.status === 'complete' || action.status === 'failed' || action.status === 'aborted'
              );
              
              if (!allCompleted) {
                await new Promise(resolve => setTimeout(resolve, 500)); // Check every 500ms
              }
            }
            
            if (allCompleted) {
              const completedActions = workbenchStore.getCompletedActionResults(messageId);
              
              if (completedActions.length > 0) {
                console.log('[AI Tool Results] All actions completed! Sending results to AI behind the scenes...');
                
                // Send tool results back to AI for continuation with a special marker to hide from UI
                const toolResultsSummary = completedActions.map(action => 
                  `Tool: ${action.toolName}\nResult: ${action.result}`
                ).join('\n\n');
                
                // Use append with a special marker that we can filter out in the UI
                await append({
                  role: 'user',
                  content: `__TOOL_RESULTS_HIDDEN__\n[TOOL RESULTS]\n${toolResultsSummary}\n\nPlease continue your response based on these tool execution results.`
                });
                
                return; // Don't continue with normal sync if we're continuing the AI conversation
              }
            } else {
              console.log('[AI Tool Results] Timeout waiting for actions to complete');
            }
          }
        }
      } catch (error) {
        console.error('[AI Tool Results] Error processing tool results:', error);
        // Continue with normal flow if tool result processing fails
      }
      
      // Normal sync to server for authenticated users (only if not continuing AI conversation)
      if (isAuthenticated) {
        // Wait longer for file watcher to detect AI-created files
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const files = workbenchStore.files.get();
        const currentChatId = chatId.get();
        const projectName = workbenchStore.firstArtifact?.title || templateData?.template?.name || 'Untitled Project';
        
        console.log('[Project Sync] Checking sync conditions:', {
          currentChatId,
          fileCount: Object.keys(files).length,
          projectName,
          hasFiles: Object.keys(files).length > 0
        });
        
        // Only sync if we have files and a chat ID
        if (currentChatId && Object.keys(files).length > 0) {
          console.log('[Project Sync] Starting sync...', { fileCount: Object.keys(files).length });
          syncProjectToServer({
            chatId: currentChatId,
            projectName,
            files,
          }).catch((error) => {
            logger.error('Background project sync failed:', error);
            // Don't show error to user - still saved locally in IndexedDB
          });
        } else {
          console.log('[Project Sync] Skipping sync - no files or chat ID');
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
      // Clear project files session storage as well
      const currentChatId = chatId.get();
      if (currentChatId) {
        sessionStorage.removeItem(`project-files-${currentChatId}`);
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

          // CRITICAL: Clear workbench store before loading new template
          // This prevents file accumulation and nested directory structures
          workbenchStore.files.set({});
          console.log('[Template Init] Cleared workbench store for fresh template load');

          // Show workbench immediately with loading state
          workbenchStore.setShowWorkbench(true);
          workbenchStore.setIsLoadingFiles(true);

          // Show loading toast
          const toastKey = `template-toast-${templateData.templateId}`;
          if (!sessionStorage.getItem(toastKey)) {
            toast.info(`Loading template files: ${templateData.template.name}...`);
            sessionStorage.setItem(toastKey, 'true');
          }

          // Fetch template files from local filesystem - REAL FILES ONLY
          let templateFiles;
          try {
            console.log('Fetching template files from local path:', templateData.template.localPath);
            templateFiles = await fetchLocalTemplateFiles(templateData.template.localPath);
            
            if (!templateFiles || templateFiles.length === 0) {
              throw new Error('No files found in template directory');
            }
            
            console.log('Successfully fetched', templateFiles.length, 'LOCAL template files');
          } catch (error) {
            console.error('Failed to fetch local template files:', error);
            throw new Error(`Cannot load template: ${error instanceof Error ? error.message : 'Local template fetch failed'}`);
          }

          // Wait for WebContainer to be ready
          const container = await webcontainer;

          // CRITICAL: Clear WebContainer working directory to prevent file accumulation
          try {
            console.log('[Template Init] Clearing WebContainer working directory...');
            await container.fs.rm(WORK_DIR, { recursive: true, force: true });
            await container.fs.mkdir(WORK_DIR, { recursive: true });
            console.log('[Template Init] WebContainer working directory cleared and recreated');
          } catch (error) {
            console.warn('[Template Init] Failed to clear WebContainer directory:', error);
            // Continue anyway - the directory might not exist yet
          }

          // Write files to the working directory AND sync to workbench store
          // This ensures both WebContainer and AI have access to the files
          for (const file of templateFiles) {
            if (file.type === 'file') {
              try {
                // Create the full path in the working directory
                const fullPath = `${WORK_DIR}/${file.path}`;
                
                // Create directory structure if needed
                const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
                if (dirPath !== WORK_DIR) {
                  await container.fs.mkdir(dirPath, { recursive: true });
                }
                
                // Write the file to the working directory
                await container.fs.writeFile(fullPath, file.content);
                console.log(`[Template Init] Wrote file: ${fullPath}`);

                    // IMPORTANT: Also add to workbench store for immediate AI context
                    // This ensures the AI can see the files without waiting for file watcher
                    // Use normalized relative path for consistency with file watcher
                    const relativePath = normalizeToRelativePath(file.path);
                    if (relativePath) {
                      workbenchStore.files.setKey(relativePath, {
                        type: 'file',
                        content: file.content,
                        isBinary: false
                      });
                    }
              } catch (error) {
                console.warn(`[Template Init] Failed to write file ${file.path}:`, error);
              }
            }
          }

          // Give a moment for file watcher to sync, then clear loading state
          await new Promise(resolve => setTimeout(resolve, 500));
          workbenchStore.setIsLoadingFiles(false);
          
          // Log final file count for debugging
          console.log(`[Template Init] Files in workbench store:`, Object.keys(workbenchStore.files.get()).length);

          // Mark as initialized
          setTemplateInitialized(true);

          // Show success toast
          const successKey = `template-success-${templateData.templateId}`;
          if (!sessionStorage.getItem(successKey)) {
            toast.success(`Template "${templateData.template.name}" loaded successfully!`);
            sessionStorage.setItem(successKey, 'true');
          }

          // Save template project to database for authenticated users
          if (isAuthenticated) {
            const currentChatId = chatId.get();
            const files = workbenchStore.files.get();
            
            if (currentChatId && Object.keys(files).length > 0) {
              console.log('[Template Init] Saving template project to database...');
              syncProjectToServer({
                chatId: currentChatId,
                projectName: templateData.template.name,
                files,
              }).catch((error) => {
                console.error('[Template Init] Failed to save project:', error);
                // Don't show error to user - still saved locally
              });
            }
          }
        })();

        // Race between initialization and timeout
        await Promise.race([initPromise, timeoutPromise]);

        } catch (error) {
          console.error('Failed to initialize template:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          
          if (errorMessage.includes('GitHub fetch failed') || errorMessage.includes('No files found')) {
            toast.error(`Failed to load real files from GitHub: ${errorMessage}. Please try a different template.`);
          } else {
            toast.error(`Failed to load template: ${errorMessage}. You can start from scratch.`);
          }
          
          setTemplateInitialized(true); // Mark as attempted to prevent retries
          workbenchStore.setIsLoadingFiles(false); // Clear loading state on error
          
          // Clear the session storage to allow retry if user wants
          if (templateData?.templateId) {
            sessionStorage.removeItem(`template-init-${templateData.templateId}`);
          }
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

  // Load existing project files when opening a project (not a template)
  useEffect(() => {
    // Early return conditions
    if (
      !isAuthenticated ||
      !isLoaded ||
      projectFilesLoaded ||
      isLoadingProjectFiles ||
      templateData?.hasTemplate || // Skip if this is a template
      initialMessages.length === 0  // Skip if no chat history (new chat)
    ) {
      return;
    }

    const currentChatId = chatId.get();
    if (!currentChatId) {
      return;
    }

    // Check if we already processed this project
    const projectKey = `project-files-${currentChatId}`;
    if (sessionStorage.getItem(projectKey)) {
      console.log('[Project Files] Already loaded for chat:', currentChatId);
      setProjectFilesLoaded(true);
      return;
    }

    console.log('[Project Files] Loading files for existing project, chatId:', currentChatId);
    setIsLoadingProjectFiles(true);

    const loadProjectFiles = async () => {
      try {
        // Call API to get project files by chatId
        const response = await fetch(`/api/project-files?chatId=${currentChatId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // No project found for this chat - this is fine for new chats
            console.log('[Project Files] No project found for chat:', currentChatId);
            setProjectFilesLoaded(true);
            return;
          }
          
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json() as { 
          success: boolean; 
          projectId: string; 
          projectName: string; 
          files: Record<string, string>; 
          count: number; 
        };
        console.log(`[Project Files] Loaded ${data.count} files for project: ${data.projectName}`);

        if (data.files && Object.keys(data.files).length > 0) {
          // CRITICAL: Clear workbench store before loading project files
          // This prevents file accumulation and nested directory structures
          workbenchStore.files.set({});
          console.log('[Project Files] Cleared workbench store for fresh project load');

          // Show workbench and loading state
          workbenchStore.setShowWorkbench(true);
          workbenchStore.setIsLoadingFiles(true);
          
          toast.info(`Loading project: ${data.projectName}...`);

          // Wait for WebContainer to be ready
          const container = await webcontainer;

          // CRITICAL: Clear WebContainer working directory to prevent file accumulation
          try {
            console.log('[Project Files] Clearing WebContainer working directory...');
            await container.fs.rm(WORK_DIR, { recursive: true, force: true });
            await container.fs.mkdir(WORK_DIR, { recursive: true });
            console.log('[Project Files] WebContainer working directory cleared and recreated');
          } catch (error) {
            console.warn('[Project Files] Failed to clear WebContainer directory:', error);
            // Continue anyway - the directory might not exist yet
          }

          // Write files to the working directory AND sync to workbench store
          for (const [filePath, content] of Object.entries(data.files)) {
            try {
              // Create the full path in the working directory
              const fullPath = `${WORK_DIR}/${filePath}`;
              
              // Create directory structure if needed
              const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
              if (dirPath !== WORK_DIR) {
                await container.fs.mkdir(dirPath, { recursive: true });
              }
              
              // Write the file to the working directory
              await container.fs.writeFile(fullPath, content as string);
              console.log(`[Project Files] Wrote file: ${fullPath}`);

              // IMPORTANT: Also add to workbench store for immediate AI context
              // Use normalized relative path for consistency with file watcher
              const relativePath = normalizeToRelativePath(filePath);
              if (relativePath) {
                workbenchStore.files.setKey(relativePath, {
                  type: 'file',
                  content: content as string,
                  isBinary: false
                });
              }
            } catch (error) {
              console.warn(`[Project Files] Failed to write file ${filePath}:`, error);
            }
          }

          // Give a moment for file watcher to sync, then clear loading state
          await new Promise(resolve => setTimeout(resolve, 500));
          workbenchStore.setIsLoadingFiles(false);
          
          toast.success(`Project "${data.projectName}" loaded successfully!`);
          console.log(`[Project Files] Files in workbench store:`, Object.keys(workbenchStore.files.get()).length);
        }

        setProjectFilesLoaded(true);
        sessionStorage.setItem(projectKey, 'true');

      } catch (error) {
        console.error('Failed to load project files:', error);
        toast.error(`Failed to load project files: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setProjectFilesLoaded(true); // Mark as attempted to prevent retries
        workbenchStore.setIsLoadingFiles(false);
      } finally {
        setIsLoadingProjectFiles(false);
      }
    };

    loadProjectFiles();

  }, [isAuthenticated, isLoaded, initialMessages.length, chatId.get()]); // Depend on auth state and chat history

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
  }, [pendingMessage, isLoaded, isAuthenticated]); // Remove sendMessage from dependencies to prevent circular reference

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

    // CRITICAL: Clear workbench when starting a fresh chat (not template, not existing project)
    // This prevents files from previous sessions persisting in the workbench
    if (!chatStarted && !templateData?.hasTemplate && !projectFilesLoaded) {
      console.log('[Fresh Chat] Clearing workbench and WebContainer for new chat session');
      workbenchStore.files.set({});
      workbenchStore.setShowWorkbench(false); // Hide workbench for fresh chats initially
      
      // Also clear WebContainer working directory to ensure clean state
      try {
        const container = await webcontainer;
        await container.fs.rm(WORK_DIR, { recursive: true, force: true });
        await container.fs.mkdir(WORK_DIR, { recursive: true });
        console.log('[Fresh Chat] WebContainer working directory cleared');
      } catch (error) {
        console.warn('[Fresh Chat] Failed to clear WebContainer directory:', error);
        // Don't fail the message send if WebContainer clearing fails
      }
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
  }, [input, isLoading, isLoaded, isAuthenticated, append, setInput, resetEnhancer, runAnimation, uploadedImages, chatStarted, templateData, projectFilesLoaded]);

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
