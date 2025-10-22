import { memo, useMemo } from 'react';
import { modificationsRegex } from '~/utils/diff';
import { Markdown } from './Markdown';

interface UserMessageProps {
  content: string;
}

export const UserMessage = memo(({ content }: UserMessageProps) => {
  const sanitizedContent = useMemo(() => sanitizeUserMessage(content), [content]);
  
  return (
    <div className="overflow-hidden break-words whitespace-pre-wrap">
      <Markdown limitedMarkdown>{sanitizedContent}</Markdown>
    </div>
  );
});

function sanitizeUserMessage(content: string) {
  return content.replace(modificationsRegex, '').trim();
}
