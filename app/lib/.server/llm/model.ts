import { createOpenAI } from '@ai-sdk/openai';

export function getXAIModel(apiKey: string) {
  const xai = createOpenAI({
    apiKey,
    baseURL: 'https://api.x.ai/v1',
  });

  return xai('grok-4-fast-reasoning');
}

// Keep backward compatibility
export const getAnthropicModel = getXAIModel;
