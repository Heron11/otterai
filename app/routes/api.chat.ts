import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { MAX_RESPONSE_SEGMENTS, MAX_TOKENS } from '~/lib/.server/llm/constants';
import { CONTINUE_PROMPT } from '~/lib/.server/llm/prompts';
import { streamText, type Messages, type StreamingOptions } from '~/lib/.server/llm/stream-text';
import SwitchableStream from '~/lib/.server/llm/switchable-stream';
import { getOptionalUserId } from '~/lib/.server/auth/clerk.server';
import { getDatabase } from '~/lib/.server/db/client';
import { checkUserCredits, deductCredit } from '~/lib/.server/credits/manager';
import { logUsage } from '~/lib/.server/credits/usage';

export async function action(args: ActionFunctionArgs) {
  return chatAction(args);
}

async function chatAction(args: ActionFunctionArgs) {
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
        model: 'grok-4-fast-reasoning',
      });
    }
  }

  const stream = new SwitchableStream();

  try {
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
    console.log(error);

    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
