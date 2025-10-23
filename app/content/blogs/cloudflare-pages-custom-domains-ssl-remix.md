---
title: Custom Domains + SSL on Cloudflare Pages for Remix Apps
description: Map your domain to Cloudflare Pages, set up SSL, redirects, and sane DNS—plus a multi-tenant strategy for SaaS apps.
author: OtterAI Team
date: 2025-10-23
tags: [Tutorial, Cloudflare, Domains, SaaS]
featured: false
coverImage: https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=600&fit=crop&q=80
---

# Custom Domains + SSL on Cloudflare Pages for Remix Apps

Shipping under your own domain is table stakes. With Cloudflare Pages and Remix, the process is quick—and secure by default. Let’s wire custom domains, SSL, and redirects, then sketch a multi-tenant strategy.

OtterAI (otterai.net) guides this flow in its templates, but the steps are universal.

## 1) Add Your Domain to Cloudflare

- Point your registrar to Cloudflare nameservers.
- Import DNS records or start clean.

## 2) Attach Domain to Your Pages Project

In the Pages dashboard:

- Add Custom Domain → `app.yourdomain.com` (or apex)
- Verify DNS (Cloudflare will add/expect a CNAME/A record)
- SSL/TLS: set to “Full (strict)” where possible

## 3) Redirects and Canonicalization

Pick one canonical host (www or apex) and redirect the other:

Examples (Pages redirects file or Worker):

```
https://yourdomain.com/*  https://www.yourdomain.com/:splat  301!
```

Force HTTPS and add HSTS after verifying everything works:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## 4) DNS Records

- `CNAME www` → Pages hostname
- `A`/`AAAA` for apex if using an orange-cloud proxy
- TXT records for domain verification, email, etc.

## 5) Multi-Tenant Domains (SaaS)

Strategy options:

- Subdomain per tenant: `tenant.yourdomain.com`
- Domain mapping: customer supplies `brand.com`

Model domain ownership and verification:

```sql
create table if not exists domains (
  id integer primary key,
  tenant_id text not null,
  hostname text unique not null,
  status text not null default 'pending', -- pending|verified|active
  verification_token text not null,
  created_at text not null default (datetime('now'))
);
```

Verification flow:

1) Generate `verification_token`
2) Ask customer to add TXT record `_verify.hostname`
3) Cron job checks DNS; if match, mark `verified`
4) Provision mapping in Pages or route a Worker

## 6) Production Checklist

- Canonical host selected and redirected (301)
- HSTS after stable HTTPS
- SSL mode set to “Full (strict)”
- Domain verification automated for mapped domains
- Health check route returning 200

## Where OtterAI Fits (Light Touch)

OtterAI (otterai.net) includes a domain model and verification UI in its SaaS template so teams can map domains confidently without yak-shaving.

## Related Reading

- /blog/website-deployment-guide-2025
- /blog/deploy-remix-cloudflare-workers-2025
- /blog/how-to-build-landing-page-2025

