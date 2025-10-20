export type ActionType = 'file' | 'shell' | 'mcp-tool';

export interface BaseAction {
  content: string;
}

export interface FileAction extends BaseAction {
  type: 'file';
  filePath: string;
}

export interface ShellAction extends BaseAction {
  type: 'shell';
}

export interface MCPToolAction extends BaseAction {
  type: 'mcp-tool';
  toolName: string;
  serverName: string;
}

export type OtterAction = FileAction | ShellAction | MCPToolAction;

export type OtterActionData = OtterAction | BaseAction;
