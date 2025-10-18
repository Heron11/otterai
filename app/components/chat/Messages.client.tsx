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
                className={classNames('flex gap-4 p-6 w-full rounded-[calc(0.75rem-1px)]', {
                  'bg-bolt-elements-messages-background border-l-4 border-[#e86b47]': isUserMessage,
                  'bg-bolt-elements-messages-background': !isUserMessage && (!isStreaming || (isStreaming && !isLast)),
                  'bg-gradient-to-b from-bolt-elements-messages-background from-30% to-transparent':
                    isStreaming && isLast && !isUserMessage,
                  'mt-4': !isFirst,
                })}
              >
                {isUserMessage ? (
                  <div className="flex items-center justify-center w-[34px] h-[34px] overflow-hidden bg-white dark:bg-neutral-700 rounded-full shrink-0 self-start">
                    <svg className="w-5 h-5 text-[#e86b47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-[34px] h-[34px] shrink-0 self-start">
                    <img src="/lightmodeavatar.svg" alt="AI" className="w-full h-full dark:hidden" />
                    <img src="/darkmodeavatar.svg" alt="AI" className="w-full h-full hidden dark:block" />
                  </div>
                )}
                <div className="grid grid-col-1 w-full">
                  {isUserMessage ? <UserMessage content={content} /> : <AssistantMessage content={content} />}
                </div>
              </div>
            );
          })
        : null}
      {isStreaming && (
        <div className="text-center w-full text-[#e86b47] i-svg-spinners:3-dots-fade text-4xl mt-4"></div>
      )}
    </div>
  );
});
