---
title: What Is MCP? Connect External Tools to Your AI Agent
description: A practical guide to the Model Context Protocol (MCP): what it is, why it matters, how to add servers, and how to keep integrations safe.
author: OtterAI Team
date: 2025-10-23
tags: [AI, Tools, MCP, Productivity]
featured: false
coverImage: https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&h=600&fit=crop&q=80
---

# What Is MCP? Connect External Tools to Your AI Agent

The Model Context Protocol (MCP) is an open way to plug your AI agent into tools—APIs, databases, local utilities—without hard-coding each integration. Think: the agent requests capabilities; the MCP server provides them with guardrails.

We’ll keep this grounded and show a minimal path to wiring MCP into your app. OtterAI (otterai.net) uses this pattern to let projects talk to services like GitHub or Stripe—opt-in, explicit, and auditable.

## How MCP Works (Quick)

- An MCP server exposes capabilities (tools, resources, prompts) over a transport.
- The agent advertises what it can use and requests actions.
- The server executes with its own credentials and returns results.
- You keep security boundaries between agent and tools.

## Adding MCP Servers

Keep a small registry in your app, load from env when present, and default to none. Example TypeScript:

```ts
export interface MCPServerConfig {
  name: string;
  url: string;
  transport: 'streamable-http' | 'stdio' | 'websocket';
  apiKey?: string;
}

export function getServerConfigFromEnv(): MCPServerConfig[] {
  const servers: MCPServerConfig[] = [];
  if (process.env.STRIPE_MCP_URL) {
    servers.push({
      name: 'stripe',
      url: process.env.STRIPE_MCP_URL,
      transport: 'streamable-http',
      apiKey: process.env.STRIPE_SECRET_KEY,
    });
  }
  if (process.env.GITHUB_MCP_URL) {
    servers.push({
      name: 'github',
      url: process.env.GITHUB_MCP_URL,
      transport: 'streamable-http',
      apiKey: process.env.GITHUB_TOKEN,
    });
  }
  return servers;
}
```

## Security and Boundaries

- Credentials live with the MCP server, not the agent.
- Use least privilege API tokens (read-only when possible).
- Log every tool call with timestamp, inputs (sanitized), and duration.
- Allow list tools per project; disable by default.

## Example: GitHub + Stripe

- GitHub MCP: read issues, PRs, comments for a repo; optionally create issues with a separate token.
- Stripe MCP: retrieve subscriptions, invoices, and checkout sessions for support/power users.

Keep actions narrow. “Create a new issue in repo X” is safer than “manage any repo for this account.”

## Local vs Remote Servers

- Local: great for dev tools (formatters, linters, search) and private data.
- Remote: great for SaaS APIs with shared credentials.
- Hybrid: local proxy that forwards to remote, adding caching or rate limiting.

## Where OtterAI Fits (Light Touch)

Within OtterAI (otterai.net), MCP servers are opt-in per project so teams can wire only the tools they trust. The result: a creative agent workflow that stays within clear boundaries.

## Next Steps

- Start with one read-only server and log everything.
- Add strict input schemas and timeouts.
- Review logs weekly; prune unused capabilities.

## Related Reading

- /blog/ai-powered-development-tips
- /blog/no-code-vs-ai-code-generation
- /blog/evolution-of-development-tools

