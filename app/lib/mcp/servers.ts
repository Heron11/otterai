import type { MCPServerConfig } from './client';

// Example MCP server configurations
// Users can add their own servers here or via the UI
export const DEFAULT_MCP_SERVERS: MCPServerConfig[] = [
  // Example: Stripe MCP server (if available)
  // {
  //   name: 'stripe',
  //   url: 'http://localhost:3001/mcp',
  //   transport: 'streamable-http',
  //   apiKey: process.env.STRIPE_SECRET_KEY
  // },
  
  // Example: GitHub MCP server (if available)
  // {
  //   name: 'github',
  //   url: 'http://localhost:3002/mcp',
  //   transport: 'streamable-http',
  //   apiKey: process.env.GITHUB_TOKEN
  // },
  
  // Example: Database MCP server (if available)
  // {
  //   name: 'database',
  //   url: 'http://localhost:3003/mcp',
  //   transport: 'streamable-http'
  // }
];

// Helper function to get server config from environment
export function getServerConfigFromEnv(): MCPServerConfig[] {
  const servers: MCPServerConfig[] = [];
  
  // Check for Stripe server
  if (process.env.STRIPE_MCP_URL) {
    servers.push({
      name: 'stripe',
      url: process.env.STRIPE_MCP_URL,
      transport: 'streamable-http',
      apiKey: process.env.STRIPE_SECRET_KEY
    });
  }
  
  // Check for GitHub server
  if (process.env.GITHUB_MCP_URL) {
    servers.push({
      name: 'github',
      url: process.env.GITHUB_MCP_URL,
      transport: 'streamable-http',
      apiKey: process.env.GITHUB_TOKEN
    });
  }
  
  // Check for Database server
  if (process.env.DATABASE_MCP_URL) {
    servers.push({
      name: 'database',
      url: process.env.DATABASE_MCP_URL,
      transport: 'streamable-http'
    });
  }
  
  return servers;
}
