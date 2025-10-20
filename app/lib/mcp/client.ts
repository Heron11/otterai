import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('MCPClient');

export interface MCPServerConfig {
  name: string;
  url: string;
  transport: 'streamable-http' | 'sse';
  apiKey?: string;
}

export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class MCPClientManager {
  private clients = new Map<string, Client>();
  private configs = new Map<string, MCPServerConfig>();

  async addServer(config: MCPServerConfig): Promise<void> {
    try {
      const client = new Client({
        name: 'otterai-client',
        version: '1.0.0'
      });

      let transport;
      const baseUrl = new URL(config.url);

      if (config.transport === 'streamable-http') {
        transport = new StreamableHTTPClientTransport(baseUrl);
      } else {
        transport = new SSEClientTransport(baseUrl);
      }

      await client.connect(transport);
      
      this.clients.set(config.name, client);
      this.configs.set(config.name, config);
      
      logger.info(`Connected to MCP server: ${config.name}`);
    } catch (error) {
      logger.error(`Failed to connect to MCP server ${config.name}:`, error);
      throw error;
    }
  }

  async callTool(serverName: string, toolName: string, args: any): Promise<MCPToolResult> {
    const client = this.clients.get(serverName);
    if (!client) {
      return {
        success: false,
        error: `MCP server '${serverName}' not found`
      };
    }

    try {
      const result = await client.callTool({
        name: toolName,
        arguments: args
      });

      return {
        success: true,
        data: result.content
      };
    } catch (error) {
      logger.error(`MCP tool call failed for ${serverName}.${toolName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async listTools(serverName: string): Promise<any[]> {
    const client = this.clients.get(serverName);
    if (!client) {
      return [];
    }

    try {
      const tools = await client.listTools();
      return tools.tools || [];
    } catch (error) {
      logger.error(`Failed to list tools for ${serverName}:`, error);
      return [];
    }
  }

  async listResources(serverName: string): Promise<any[]> {
    const client = this.clients.get(serverName);
    if (!client) {
      return [];
    }

    try {
      const resources = await client.listResources();
      return resources.resources || [];
    } catch (error) {
      logger.error(`Failed to list resources for ${serverName}:`, error);
      return [];
    }
  }

  getAvailableServers(): string[] {
    return Array.from(this.clients.keys());
  }

  async disconnect(serverName: string): Promise<void> {
    const client = this.clients.get(serverName);
    if (client) {
      await client.close();
      this.clients.delete(serverName);
      this.configs.delete(serverName);
      logger.info(`Disconnected from MCP server: ${serverName}`);
    }
  }

  async disconnectAll(): Promise<void> {
    const serverNames = Array.from(this.clients.keys());
    await Promise.all(serverNames.map(name => this.disconnect(name)));
  }
}

// Global instance
export const mcpClientManager = new MCPClientManager();
