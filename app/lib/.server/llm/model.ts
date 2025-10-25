import { createOpenAI } from '@ai-sdk/openai';

export function getXAIModel(apiKey: string) {
  const xai = createOpenAI({
    name: 'xai',
    apiKey,
    baseURL: 'https://api.x.ai/v1',
  });

  // xAI models via OpenAI-compatible API
  return xai.chat('grok-beta');
}

// Keep backward compatibility
export const getAnthropicModel = getXAIModel;
