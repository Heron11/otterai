import type { Message } from 'ai';
import React, { memo } from 'react';
import { classNames } from '~/utils/classNames';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';

interface MessagesProps {
  id?: string;
  className?: string;
  isStreaming?: boolean;
  messages?: Message[];
}

// Memoized individual message component for better performance
const MessageItem = memo(({ 
  message, 
  index, 
  isFirst, 
  isLast, 
  isStreaming 
}: { 
  message: Message; 
  index: number; 
  isFirst: boolean; 
  isLast: boolean; 
  isStreaming: boolean;
}) => {
  const { role, content } = message;
  const isUserMessage = role === 'user';
  
  // Check if user message has images to adjust bubble styling
  const hasImages = isUserMessage && Array.isArray(content) && content.some(c => c.type === 'image');
  
  // Determine content characteristics for dynamic styling
  const isShortText = isUserMessage && typeof content === 'string' && content.length < 50;
  const isLongText = isUserMessage && typeof content === 'string' && content.length > 200;

  return (
    <div
      className={classNames('w-full', {
        'mt-4': !isFirst,
      })}
    >
      {isUserMessage ? (
        // User message - right aligned with background
        <div className="flex justify-end">
          <div className={classNames(
            'max-w-[80%] bg-bolt-elements-messages-background shadow-sm text-bolt-elements-textPrimary',
            {
              // Dynamic corner radius based on content
              'rounded-3xl px-4 py-3': hasImages || isLongText, // More rectangular for complex content
              'rounded-2xl px-5 py-3': !hasImages && !isShortText && !isLongText, // Medium radius for normal text
              'rounded-full px-6 py-3': !hasImages && isShortText, // Pill shape only for very short text
            }
          )}>
            <UserMessage content={content} />
          </div>
        </div>
      ) : (
        // AI message - left aligned, transparent background
        <div className="flex justify-start">
          <div className={classNames('max-w-[90%] px-4 py-3 text-bolt-elements-textPrimary', {
            'bg-transparent': !isStreaming || (isStreaming && !isLast),
            'bg-gradient-to-b from-transparent from-30% to-transparent': isStreaming && isLast,
          })}>
            <AssistantMessage content={content} />
          </div>
        </div>
      )}
    </div>
  );
});

export const Messages = memo(React.forwardRef<HTMLDivElement, MessagesProps>((props: MessagesProps, ref) => {
  const { id, isStreaming = false, messages = [] } = props;

  // Filter out hidden tool result messages
  const visibleMessages = messages.filter(message => {
    if (message.role === 'user' && typeof message.content === 'string') {
      return !message.content.startsWith('__TOOL_RESULTS_HIDDEN__');
    }
    return true;
  });

  return (
    <div id={id} ref={ref} className={props.className}>
      {visibleMessages.length > 0
        ? visibleMessages.map((message, index) => (
            <MessageItem
              key={message.id || `message-${index}`}
              message={message}
              index={index}
              isFirst={index === 0}
              isLast={index === visibleMessages.length - 1}
              isStreaming={isStreaming}
            />
          ))
        : null}
      {isStreaming && (
        <div className="flex justify-start mt-4">
          <div className="max-w-[90%] px-4 py-3">
            <div className="text-[#e86b47] i-svg-spinners:3-dots-fade text-2xl"></div>
          </div>
        </div>
      )}
    </div>
  );
}));
