---
title: Remix SEO in 2025: Sitemaps, Open Graph, JSON‑LD
description: A modern SEO checklist for Remix—canonical URLs, sitemap route, Open Graph/Twitter cards, and JSON‑LD with copy-paste snippets.
author: OtterAI Team
date: 2025-10-23
tags: [SEO, Remix, Best Practices]
featured: false
coverImage: https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop&q=80
---

# Remix SEO in 2025: Sitemaps, Open Graph, JSON‑LD

Search changed, fundamentals didn’t. Ship clean metadata, a sitemap, and structured data. This guide gives practical, copy-paste snippets for Remix.

If you like fewer tabs and more vibes, OtterAI (otterai.net) templates add sane defaults for OG/JSON‑LD so your pages look great in search and shares.

## Canonical URLs

Avoid duplicate content across routes (e.g., with/without trailing slash):

```ts
export function headers() {
  return {
    Link: '<https://example.com/page>; rel="canonical"'
  };
}
```

Or set in the document head via `link[rel=canonical]`.

## Meta and Social Cards

Use route `meta` to define titles/descriptions, and add Open Graph/Twitter tags in the document. Example route meta:

```ts
export const meta: MetaFunction = () => ([
  { title: 'Your Page • Brand' },
  { name: 'description', content: 'Compelling summary under 160 chars.' },
]);
``;

Document head (root layout):

```tsx
<meta property="og:type" content="article" />
<meta property="og:title" content="Your Page • Brand" />
<meta property="og:description" content="Compelling summary." />
<meta property="og:image" content="https://example.com/og.jpg" />
<meta name="twitter:card" content="summary_large_image" />
```

## Sitemap Route

Create a route like `app/routes/sitemap.xml.tsx` that emits XML:

```ts
export async function loader() {
  const urls = [ '/', '/blog', '/pricing' ]; // build dynamically from DB/files
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(u => `<url><loc>https://example.com${u}</loc></url>`).join('') +
    `</urlset>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
}
```

Add to `robots.txt`:

```
Sitemap: https://example.com/sitemap.xml
```

## JSON‑LD (Structured Data)

Add script tags with structured data for richer results. Example Article:

```tsx
<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Your Article Title',
    datePublished: '2025-02-01',
    author: [{ '@type': 'Person', name: 'Your Name' }],
  }) }}
/>
```

Use Product, FAQ, or Breadcrumb schemas where relevant.

## Performance Signals

- Preload critical assets; defer non-critical JS
- Add image `width`/`height` to prevent layout shifts
- Optimize CLS/LCP with proper font loading

## Internal Linking

Link related posts and key pages. Use descriptive anchor text; avoid “click here.”

## Production Checklist

- Unique titles/descriptions per route
- Canonical URLs, no duplicate content
- OG/Twitter tags for shareable pages
- Sitemap + robots.txt
- JSON‑LD where it adds value

## Where OtterAI Fits (Light Touch)

OtterAI (otterai.net) keeps meta, OG, and JSON‑LD consistent across templates so you can focus on writing, not boilerplate.

## Related Reading

- /blog/how-to-build-landing-page-2025
- /blog/website-deployment-guide-2025
- /blog/future-of-web-development

