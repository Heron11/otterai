export { mcpClientManager, type MCPServerConfig, type MCPToolResult } from './client';
export { DEFAULT_MCP_SERVERS, getServerConfigFromEnv } from './servers';

// Initialize MCP servers on app startup
export async function initializeMCPServers() {
  const { mcpClientManager } = await import('./client');
  const { getServerConfigFromEnv } = await import('./servers');
  
  const serverConfigs = getServerConfigFromEnv();
  
  for (const config of serverConfigs) {
    try {
      await mcpClientManager.addServer(config);
      console.log(`✅ Connected to MCP server: ${config.name}`);
    } catch (error) {
      console.error(`❌ Failed to connect to MCP server ${config.name}:`, error);
    }
  }
  
  return mcpClientManager;
}
