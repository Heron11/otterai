import { memo } from 'react';
import { Markdown } from './Markdown';

interface AssistantMessageProps {
  content: string;
}

export const AssistantMessage = memo(({ content }: AssistantMessageProps) => {
  return (
    <div className="w-full">
      <div className="break-words leading-relaxed text-bolt-elements-textPrimary">
        <Markdown html>{content}</Markdown>
      </div>
    </div>
  );
});
