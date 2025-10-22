import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import type { Messages, StreamingOptions } from '~/lib/.server/llm/stream-text';

export async function action(args: ActionFunctionArgs) {
  return chatAction(args);
}

async function chatAction(args: ActionFunctionArgs) {
  // Import server-only modules inside the function
  const { 
    MAX_RESPONSE_SEGMENTS, 
    MAX_TOKENS 
  } = await import('~/lib/.server/llm/constants');
  const { CONTINUE_PROMPT } = await import('~/lib/.server/llm/prompts');
  const { streamText } = await import('~/lib/.server/llm/stream-text');
  const SwitchableStream = (await import('~/lib/.server/llm/switchable-stream')).default;
  const { getOptionalUserId } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase } = await import('~/lib/.server/db/client');
  const { checkUserCredits, deductCredit } = await import('~/lib/.server/credits/manager');
  const { logUsage } = await import('~/lib/.server/credits/usage');

  const { context, request } = args;
  const { messages } = await request.json<{ messages: Messages }>();

  // Check if user is authenticated and has credits
  const userId = await getOptionalUserId(args);
  
  if (userId) {
    const db = getDatabase(context.cloudflare.env);
    const credits = await checkUserCredits(db, userId);
    
    // If user has no credits, return 402 Payment Required
    if (credits !== null && credits < 1) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient credits. Please upgrade your plan to continue.',
          code: 'CREDITS_EXHAUSTED'
        }),
        {
          status: 402,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Deduct credit before processing
    if (credits !== null) {
      await deductCredit(db, userId, 1);
      await logUsage(db, userId, {
        messageCount: 1,
        creditsUsed: 1,
        model: 'claude-haiku-4-5',
      });
    }
  }

  const stream = new SwitchableStream();

  try {
    // Log the incoming messages for debugging
    console.log('Received messages:', JSON.stringify(messages, null, 2));

    const options: StreamingOptions = {
      toolChoice: 'none',
      onFinish: async ({ text: content, finishReason }) => {
        if (finishReason !== 'length') {
          return stream.close();
        }

        if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
          throw Error('Cannot continue message: Maximum segments reached');
        }

        const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;

        console.log(`Reached max token limit (${MAX_TOKENS}): Continuing message (${switchesLeft} switches left)`);

        messages.push({ role: 'assistant', content });
        messages.push({ role: 'user', content: CONTINUE_PROMPT });

        const result = await streamText(messages, context.cloudflare.env, options);

        return stream.switchSource(result.toAIStream());
      },
    };

    const result = await streamText(messages, context.cloudflare.env, options);

    stream.switchSource(result.toAIStream());

    return new Response(stream.readable, {
      status: 200,
      headers: {
        contentType: 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    throw new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal Server Error',
      stack: error instanceof Error ? error.stack : undefined 
    }), {
      status: 500,
      statusText: 'Internal Server Error',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
