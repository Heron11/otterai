import { memo, useMemo } from 'react';
import { modificationsRegex } from '~/utils/diff';
import { Markdown } from './Markdown';

type ContentBlock = {
  type: 'text' | 'image';
  text?: string;
  image?: string; // data URL format: data:image/jpeg;base64,xxx
};

interface UserMessageProps {
  content: string | ContentBlock[];
}

export const UserMessage = memo(({ content }: UserMessageProps) => {
  const { textContent, images, hasImages } = useMemo(() => {
    if (typeof content === 'string') {
      return { 
        textContent: sanitizeUserMessage(content), 
        images: [] as ContentBlock[],
        hasImages: false
      };
    }

    // Multimodal content - separate text and images
    const textParts = content.filter(c => c.type === 'text');
    const imageParts = content.filter(c => c.type === 'image');
    
    return {
      textContent: sanitizeUserMessage(textParts.map(c => c.text || '').join('\n')),
      images: imageParts,
      hasImages: imageParts.length > 0
    };
  }, [content]);
  
  return (
    <div className="w-full">
      {/* Show images if any */}
      {hasImages && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img.image}
              alt="Uploaded"
              className="rounded-lg max-w-full h-auto object-contain shadow-sm border border-gray-200 dark:border-gray-700"
              style={{ maxHeight: '300px' }}
            />
          ))}
        </div>
      )}
      
      {/* Show text */}
      {textContent && (
        <div className="break-words whitespace-pre-wrap leading-relaxed text-bolt-elements-textPrimary">
          <Markdown limitedMarkdown>{textContent}</Markdown>
        </div>
      )}
    </div>
  );
});

function sanitizeUserMessage(content: string) {
  return content.replace(modificationsRegex, '').trim();
}
