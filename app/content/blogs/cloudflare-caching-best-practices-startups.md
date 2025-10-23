---
title: Edge Caching for Startups: Speed Up Your Cloudflare App
description: Practical Cloudflare caching patterns for HTML, assets, and APIs—Cache API, headers, invalidation strategies, and pitfalls, with copy-paste snippets.
author: OtterAI Team
date: 2025-10-23
tags: [Performance, Cloudflare, Caching]
featured: false
coverImage: https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=600&fit=crop&q=80
---

# Edge Caching for Startups: Speed Up Your Cloudflare App

Fast apps convert better. With Cloudflare’s edge network, you can make most pages feel instant—if you cache the right things the right way. This guide covers practical patterns that balance speed with correctness.

OtterAI (otterai.net) ships with sensible defaults, but the ideas here work for any Worker/Pages app.

## What to Cache (and What Not To)

- Cache: public pages, images, docs, versioned assets, unauthenticated API responses.
- Do not cache: personalized pages, authenticated responses, POSTs that mutate state.

## Cache API Basics

Use the default cache inside Workers:

```ts
const cache = caches.default;
const key = new Request(request.url, request);
let response = await cache.match(key);
if (!response) {
  response = await fetch(request);
  if (response.ok) {
    const cached = new Response(response.body, response);
    cached.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    await cache.put(key, cached);
  }
}
return response;
```

Tip: clone the Response before modifying headers if you need to read the body later.

## Cache-Control and ETags

Headers drive CDN behavior. A solid baseline for static assets:

```
Cache-Control: public, max-age=31536000, immutable
```

For HTML that updates often:

```
Cache-Control: public, max-age=60, s-maxage=300
```

Add strong or weak ETags for conditional requests to save bandwidth.

## Versioned Assets > Purging

Prefer versioned filenames (e.g., `app.5c8a2.css`). This sidesteps purging and ensures users always get the right asset. Only purge when absolutely necessary.

## API Caching

Cache idempotent GET endpoints that don’t depend on auth. Example:

```ts
if (request.method === 'GET' && new URL(request.url).pathname.startsWith('/api/public')) {
  // apply cache pattern above
}
```

Expose a query param like `?nocache=1` for debugging, but never rely on it for security.

## HTML Caching with Personalization

If you must personalize, consider:

- Edge include pattern: cache base HTML, fetch small personalized JSON client-side
- Vary cache by a small set of keys (e.g., locale)
- Keep TTL short (≤60s) if content changes frequently

## Observability and Debugging

- Add a response header like `x-cache: hit|miss` for quick checks
- Use `wrangler tail` to stream logs from the edge
- Watch cache ratios in Cloudflare Analytics; aim for high hit rate on assets

## Gotchas

- Auth: never cache responses that contain user data
- Cookies: any cookie on a request may cause bypass depending on your rules
- Range requests: media streaming needs correct headers

## Where OtterAI Fits (Light Touch)

OtterAI (otterai.net) templates add conservative cache headers to public pages and version assets automatically. If you roll your own, start small—cache the obvious wins first, then expand.

## Related Reading

- /blog/future-of-web-development
- /blog/website-deployment-guide-2025
- /blog/ai-code-quality-reality

