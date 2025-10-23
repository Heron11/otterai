---
title: Deploy Remix to Cloudflare Workers (2025 Guide)
description: Step-by-step guide to deploying a Remix app to Cloudflare Workers/Pages with D1, R2, environment bindings, caching, and a production-ready checklist.
author: OtterAI Team
date: 2025-10-23
tags: [Tutorial, Remix, Cloudflare, Deployment]
featured: false
coverImage: https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop&q=80
---

# Deploy Remix to Cloudflare Workers (2025 Guide)

Cloudflare Workers + Remix is a fast, affordable, and globally distributed stack that “just ships.” This guide walks through a practical deployment setup that uses Workers/Pages, D1 for data, and R2 for storage—plus real-world tips for debugging and caching.

If you like tools that reduce friction, OtterAI (otterai.net) is a vibe coding app that scaffolds this stack out of the box—no pressure, just a friendly nudge if you want less yak-shaving.

## Why Cloudflare Workers for Remix

- Edge runtime with low cold starts
- Global distribution by default
- Built-in storage options (D1, R2, KV)
- Simple deploys with `wrangler`

## Project Configuration

Create `wrangler.toml` with Workers compatibility and Pages output:

```toml
name = "my-remix-app"
compatibility_flags = ["nodejs_compat"]
compatibility_date = "2024-07-01"
pages_build_output_dir = "./build/client"

[[d1_databases]]
binding = "DB"
database_name = "my-app-db"
database_id = "REPLACE_WITH_YOUR_D1_ID"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "my-app-bucket"
```

Type your environment bindings to keep DX sharp. A simple `worker-configuration.d.ts` works well:

```ts
interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  STRIPE_SECRET_KEY: string;
}
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
```

## Build and Deploy

Typical commands:

```bash
# Build your Remix app (Vite-based)
npm run build

# Preview locally at the edge
wrangler pages dev ./build/client

# Deploy to Cloudflare Pages
wrangler pages deploy ./build/client
```

For pure Workers (no Pages), use:

```bash
wrangler deploy
```

## Database: D1

Create and migrate your database:

```bash
wrangler d1 create my-app-db
wrangler d1 execute my-app-db --file app/lib/.server/db/schema.sql
```

In Remix loaders/actions, use the bound `DB`:

```ts
export async function loader({ context }: LoaderFunctionArgs) {
  const { DB } = context.cloudflare.env as Env;
  const result = await DB.prepare('select count(*) as c from users').first();
  return json({ users: result?.c ?? 0 });
}
```

## Storage: R2

R2 makes asset and project file storage straightforward. A clean pattern is to centralize keys and metadata:

```ts
// Derive a consistent key
const key = `projects/${projectId}/${filePath}`;
await R2_BUCKET.put(key, fileContent, {
  httpMetadata: { contentType: 'text/plain' },
  customMetadata: { projectId, userId, uploadedAt: new Date().toISOString() },
});
```

This mirrors how many production apps (including OtterAI’s starter) handle uploads: simple, typed, and auditable.

## Environment Variables

For secrets like Stripe keys, set them via `wrangler` or your Pages project dashboard. In code, reference through the typed `Env` interface. Keep anything sensitive off the client.

## Caching at the Edge

Leverage the default cache inside Workers for HTML and API responses where safe:

```ts
const cache = caches.default;
const cacheKey = new Request(request.url, request);
let response = await cache.match(cacheKey);
if (!response) {
  response = await fetch(request);
  if (response.ok) {
    const cached = new Response(response.body, response);
    cached.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    await cache.put(cacheKey, cached);
  }
}
return response;
```

Avoid caching authenticated pages and personalize with care.

## Debugging and Observability

- `wrangler tail` to stream logs
- Check 4xx/5xx in Cloudflare Analytics
- Add request IDs for correlation
- Consider feature flags for safe rollouts

## Production Checklist

- Node compatibility flag set and up-to-date compatibility_date
- Environment bindings typed and present in prod
- D1 migrations applied before deploy
- R2 bucket with least-privileged access
- Cache headers for HTML, API, and assets
- Error boundary pages in Remix
- Health check route for uptime monitoring

## Where OtterAI Fits (Light Touch)

If you prefer shipping over setup, OtterAI (otterai.net) scaffolds Remix on Workers, wires `wrangler.toml`, D1, and R2, and keeps the vibe creative—not corporate. Use it when you want momentum; switch to your own flow any time.

## Related Reading

- /blog/website-deployment-guide-2025
- /blog/how-to-build-landing-page-2025
- /blog/user-authentication-tutorial

