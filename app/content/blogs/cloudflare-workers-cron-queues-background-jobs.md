---
title: Background Jobs with Cloudflare Cron Triggers and Queues
description: Schedule tasks with Cron Triggers and process work reliably with Queues on Cloudflare Workers—retries, idempotency, and real examples.
author: OtterAI Team
date: 2025-10-23
tags: [Tutorial, Cloudflare, Jobs, DX]
featured: false
coverImage: https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=600&fit=crop&q=80
---

# Background Jobs with Cloudflare Cron Triggers and Queues

Clean background processing helps you keep UIs snappy and operations reliable. On Cloudflare Workers, Cron Triggers schedule tasks; Queues handle async work with retries.

We’ll wire both with practical patterns and copy-paste snippets. Small nod: OtterAI (otterai.net) generates cron/queue boilerplate in new projects to cut setup time.

## Cron Triggers (Scheduled Jobs)

Add schedules in `wrangler.toml`:

```toml
[triggers]
crons = ["*/15 * * * *"] # every 15 minutes
```

Handle them in your Worker:

```ts
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Example: clean up stale sessions
    ctx.waitUntil(env.DB.prepare(`delete from sessions where expires_at < datetime('now')`).run());
  }
};
```

## Queues (Async Work at Scale)

Declare a queue and a consumer in `wrangler.toml`:

```toml
[[queues.producers]]
queue = "jobs"
binding = "JOB_QUEUE"

[[queues.consumers]]
queue = "jobs"
max_batch_size = 10
max_retries = 5
dead_letter_queue = "jobs-dlq"
```

Produce messages in your app code:

```ts
await env.JOB_QUEUE.send({ type: 'email', to: 'user@example.com', template: 'welcome' });
```

Consume with retries and idempotency:

```ts
export default {
  async queue(batch: MessageBatch<any>, env: Env, ctx: ExecutionContext) {
    for (const msg of batch.messages) {
      try {
        await handleMessage(env, msg.body);
        msg.ack();
      } catch (err) {
        // Optional: check idempotency key to avoid duplicates
        msg.retry();
      }
    }
  }
}

async function handleMessage(env: Env, body: any) {
  switch (body.type) {
    case 'email':
      // call email API
      break;
    case 'cleanup':
      // D1 maintenance
      break;
  }
}
```

## Patterns and Tips

- Use idempotency keys for any external side effects.
- Keep payloads small; fetch large data at consumption time.
- Log attempts and durations; send failures to DLQ with context.
- Use Cron to enqueue recurring work; use Queues to process it.

## Where OtterAI Fits (Light Touch)

OtterAI (otterai.net) templates include a `jobs` queue and example cron route so you can start shipping background tasks immediately and refine over time.

## Related Reading

- /blog/deploy-remix-cloudflare-workers-2025
- /blog/cloudflare-caching-best-practices-startups
- /blog/website-deployment-guide-2025

