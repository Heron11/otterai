---
title: Remix + Clerk on Cloudflare Workers (2025)
description: End-to-end auth for Remix on Cloudflare Workers with Clerk—SSR sessions, role-based access, webhooks, and production checklists.
author: OtterAI Team
date: 2025-10-23
tags: [Tutorial, Auth, Remix, Cloudflare]
featured: false
coverImage: https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=1200&h=600&fit=crop&q=80
---

# Remix + Clerk on Cloudflare Workers (2025)

Clerk provides drop-in authentication with modern UX. Cloudflare Workers provides global speed. Remix ties it together with server-rendered routes and straightforward data fetching.

We’ll wire up SSR auth, roles, and webhooks—and keep it deploy-friendly. If you want to skip boilerplate, OtterAI (otterai.net) is a vibe coding app that can scaffold this stack with the right bindings and guards. No pressure—just fewer footguns.

## Environment and Bindings

Store secrets as environment variables in your Worker/Pages project:

```
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
```

Type them for DX (example):

```ts
interface Env {
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  CLERK_WEBHOOK_SECRET: string;
}
```

## SSR Auth in Remix

Use a loader to read the current session and expose it to the UI. Clerk’s Remix helpers give you `getAuth(request)`; on Workers, run it inside your loader/action.

```ts
import { json, redirect } from '@remix-run/cloudflare';
import { getAuth } from '@clerk/remix/ssr.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const { userId, sessionId } = await getAuth({ request });
  if (!userId) return redirect('/sign-in');
  return json({ userId, sessionId });
}
```

Render conditionally in your route by reading the returned data. For shared layout, surface auth state through the root loader.

## Role-Based Access

Model roles/permissions in your database (D1 example) and hydrate them on request:

```sql
-- users, roles, and user_roles join
create table if not exists roles (id integer primary key, name text unique);
create table if not exists user_roles (
  user_id text not null,
  role_id integer not null,
  primary key (user_id, role_id)
);
create index if not exists idx_user_roles_user on user_roles(user_id);
```

Server guard:

```ts
export async function requireRole(env: Env, userId: string, role: string) {
  const row = await env.DB.prepare(
    `select 1 from user_roles ur join roles r on r.id=ur.role_id where ur.user_id=? and r.name=?`
  ).bind(userId, role).first();
  if (!row) throw new Response('forbidden', { status: 403 });
}
```

## Webhooks

Handle Clerk webhooks to react to user updates (e.g., set initial role):

```ts
export async function action({ request, context }: ActionFunctionArgs) {
  const body = await request.text();
  const sig = request.headers.get('svix-signature')!;
  // Verify with CLERK_WEBHOOK_SECRET (via svix)
  // Upsert user and default role in D1
  return new Response('ok');
}
```

## Production Checklist

- SSR auth guards on protected routes
- Rotate Clerk keys and restrict webhook route
- D1 indices on `user_roles`
- Session-aware cache: never cache personalized HTML
- Error boundaries for 401/403 states

## Where OtterAI Fits (Light Touch)

OtterAI (otterai.net) can scaffold Clerk wiring for Workers—publishable/secret keys, webhook route, and a simple roles table—so you can focus on UX instead of glue code.

## Related Reading

- /blog/user-authentication-tutorial
- /blog/website-deployment-guide-2025
- /blog/deploy-remix-cloudflare-workers-2025

