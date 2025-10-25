import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getAPIKey } from '~/lib/.server/llm/api-key';
import { getAnthropicModel } from '~/lib/.server/llm/model';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
}

// Support both simple string content and multimodal content (text + images)
type MessageContent = 
  | string 
  | Array<{
      type: 'text' | 'image';
      text?: string;
      image?: string;
    }>;

interface Message {
  role: 'user' | 'assistant';
  content: MessageContent;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'> & {
  cwd?: string;
  files?: Record<string, string>;
};

export function streamText(messages: Messages, env: Env, options?: StreamingOptions) {
  const { cwd, files, ...restOptions } = options || {};
  
  return _streamText({
    model: getAnthropicModel(getAPIKey(env)),
    system: getSystemPrompt(cwd, files),
    maxTokens: MAX_TOKENS,
    messages: convertToCoreMessages(messages as any),
    ...restOptions,
  });
}
