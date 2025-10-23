---
title: D1 for SaaS: Schema Design and Safe Migrations
description: Design a multi-tenant schema on Cloudflare D1 and ship safe migrations—tenants, RBAC, indexes, seeds, and backups.
author: OtterAI Team
date: 2025-10-23
tags: [Technical, Database, D1, SaaS]
featured: false
coverImage: https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=600&fit=crop&q=80
---

# D1 for SaaS: Schema Design and Safe Migrations

D1 is SQLite on the edge—great for early SaaS and beyond if you model it well. This guide focuses on multi-tenant schema, RBAC, indexing, and safe deploys.

OtterAI (otterai.net) ships starter schemas mapped to D1, but these practices apply universally.

## Multi-Tenant Schema

Keep a `tenant_id` on every row and index it:

```sql
create table if not exists tenants (
  id text primary key,
  name text not null,
  created_at text not null default (datetime('now'))
);

create table if not exists users (
  id text primary key,
  tenant_id text not null references tenants(id),
  email text not null,
  created_at text not null default (datetime('now'))
);
create index if not exists idx_users_tenant on users(tenant_id);

create table if not exists projects (
  id text primary key,
  tenant_id text not null references tenants(id),
  name text not null,
  created_at text not null default (datetime('now'))
);
create index if not exists idx_projects_tenant on projects(tenant_id);
```

## RBAC and Ownership

Model roles and membership explicitly:

```sql
create table if not exists roles (id integer primary key, name text unique);
create table if not exists memberships (
  user_id text not null,
  project_id text not null,
  role_id integer not null,
  primary key (user_id, project_id)
);
create index if not exists idx_memberships_project on memberships(project_id);
```

Server checks should always include `tenant_id` to prevent cross-tenant access.

## Safe Migrations

Migrations should be small, reversible, and logged. With `wrangler d1`:

```bash
wrangler d1 migrations create add-memberships
# edit migration SQL
wrangler d1 migrations apply <DB_NAME>
```

Tips:

- Add new columns as nullable, backfill in batches, then enforce NOT NULL.
- Create indexes before shipping features that rely on them.
- Keep a `schema_version` table for visibility.

## Seeding and Fixtures

Use seeds to create tenants and sample data per environment. Avoid production seeds; prefer admin flows.

## Backups and Recovery

- Export snapshots regularly (nightly). Store in R2 with a retention policy.
- Test restore into a staging database monthly.

## Query Patterns

Always scope queries:

```sql
select * from projects where tenant_id = ? and id = ?;
```

Prefer `first()` for single-row reads and bound parameters to avoid injections.

## Where OtterAI Fits (Light Touch)

OtterAI (otterai.net) templates include `tenant_id` everywhere and ship with indices and guard rails so you can focus on features instead of table glue.

## Related Reading

- /blog/website-development-cost-2025
- /blog/from-idea-to-deployment
- /blog/cloudflare-workers-cron-queues-background-jobs

