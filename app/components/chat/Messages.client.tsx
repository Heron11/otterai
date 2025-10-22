import type { Message } from 'ai';
import React from 'react';
import { classNames } from '~/utils/classNames';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';

interface MessagesProps {
  id?: string;
  className?: string;
  isStreaming?: boolean;
  messages?: Message[];
}

export const Messages = React.forwardRef<HTMLDivElement, MessagesProps>((props: MessagesProps, ref) => {
  const { id, isStreaming = false, messages = [] } = props;

  return (
    <div id={id} ref={ref} className={props.className}>
      {messages.length > 0
        ? messages.map((message, index) => {
            const { role, content } = message;
            const isUserMessage = role === 'user';
            const isFirst = index === 0;
            const isLast = index === messages.length - 1;

            return (
              <div
                key={index}
                className={classNames('w-full', {
                  'mt-4': !isFirst,
                })}
              >
                {isUserMessage ? (
                  // User message - right aligned with background
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-bolt-elements-messages-background rounded-full px-6 py-3 shadow-sm flex items-center">
                      <UserMessage content={content} />
                    </div>
                  </div>
                ) : (
                  // AI message - left aligned, transparent background
                  <div className="flex justify-start">
                    <div className={classNames('max-w-[90%] px-4 py-3', {
                      'bg-transparent': !isStreaming || (isStreaming && !isLast),
                      'bg-gradient-to-b from-transparent from-30% to-transparent': isStreaming && isLast,
                    })}>
                      <AssistantMessage content={content} />
                    </div>
                  </div>
                )}
              </div>
            );
          })
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
});
