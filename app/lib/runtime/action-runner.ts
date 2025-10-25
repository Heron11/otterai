import { WebContainer } from '@webcontainer/api';
import { map, type MapStore } from 'nanostores';
import * as nodePath from 'node:path';
import type { OtterAction } from '~/types/actions';
import { mcpClientManager } from '~/lib/mcp/client';
import { createScopedLogger } from '~/utils/logger';
import { unreachable } from '~/utils/unreachable';
import { WORK_DIR } from '~/utils/constants';
import type { ActionCallbackData } from './message-parser';

const logger = createScopedLogger('ActionRunner');

export type ActionStatus = 'pending' | 'running' | 'complete' | 'aborted' | 'failed';

export type BaseActionState = OtterAction & {
  status: Exclude<ActionStatus, 'failed'>;
  abort: () => void;
  executed: boolean;
  abortSignal: AbortSignal;
  result?: string; // Store command output/results
};

export type FailedActionState = OtterAction &
  Omit<BaseActionState, 'status'> & {
    status: Extract<ActionStatus, 'failed'>;
    error: string;
  };

export type ActionState = BaseActionState | FailedActionState;

type BaseActionUpdate = Partial<Pick<BaseActionState, 'status' | 'abort' | 'executed' | 'result'>>;

export type ActionStateUpdate =
  | BaseActionUpdate
  | (Omit<BaseActionUpdate, 'status'> & { status: 'failed'; error: string });

type ActionsMap = MapStore<Record<string, ActionState>>;

export class ActionRunner {
  #webcontainer: Promise<WebContainer>;
  #currentExecutionPromise: Promise<void> = Promise.resolve();

  actions: ActionsMap = map({});

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise;
  }

  addAction(data: ActionCallbackData) {
    const { actionId } = data;

    const actions = this.actions.get();
    const action = actions[actionId];

    if (action) {
      // action already added
      return;
    }

    const abortController = new AbortController();

    this.actions.setKey(actionId, {
      ...data.action,
      status: 'pending',
      executed: false,
      abort: () => {
        abortController.abort();
        this.#updateAction(actionId, { status: 'aborted' });
      },
      abortSignal: abortController.signal,
    });

    this.#currentExecutionPromise.then(() => {
      this.#updateAction(actionId, { status: 'running' });
    });
  }

  async runAction(data: ActionCallbackData) {
    const { actionId } = data;
    const action = this.actions.get()[actionId];

    if (!action) {
      unreachable(`Action ${actionId} not found`);
    }

    if (action.executed) {
      return;
    }

    this.#updateAction(actionId, { ...action, ...data.action, executed: true });

    this.#currentExecutionPromise = this.#currentExecutionPromise
      .then(() => {
        return this.#executeAction(actionId);
      })
      .catch((error) => {
        console.error('Action failed:', error);
      });
  }

  async #executeAction(actionId: string) {
    const action = this.actions.get()[actionId];

    this.#updateAction(actionId, { status: 'running' });

    try {
      switch (action.type) {
        case 'shell': {
          await this.#runShellAction(actionId, action);
          break;
        }
        case 'file': {
          await this.#runFileAction(actionId, action);
          break;
        }
        case 'mcp-tool': {
          await this.#runMCPToolAction(actionId, action);
          break;
        }
      }

      this.#updateAction(actionId, { status: action.abortSignal.aborted ? 'aborted' : 'complete' });
    } catch (error) {
      this.#updateAction(actionId, { status: 'failed', error: 'Action failed' });

      // re-throw the error to be caught in the promise chain
      throw error;
    }
  }

  async #runShellAction(actionId: string, action: ActionState) {
    if (action.type !== 'shell') {
      unreachable('Expected shell action');
    }

    const webcontainer = await this.#webcontainer;

    const process = await webcontainer.spawn('jsh', ['-c', action.content], {
      env: { npm_config_yes: true },
    });

    action.abortSignal.addEventListener('abort', () => {
      process.kill();
    });

    // CRITICAL: Capture command output for AI feedback
    let output = '';
    const decoder = new TextDecoder();
    
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          const chunk = decoder.decode(data);
          output += chunk;
          // Also log to console for debugging
          console.log('[ActionRunner Shell Output]:', chunk);
        },
      }),
    );

    const exitCode = await process.exit;

    // Store the complete output in action result
    const result = `Command: ${action.content}\nExit Code: ${exitCode}\nOutput:\n${output.trim()}`;
    this.#updateAction(actionId, { result });

    logger.debug(`Process terminated with code ${exitCode}`, { output: output.trim() });
  }

  async #runFileAction(actionId: string, action: ActionState) {
    if (action.type !== 'file') {
      unreachable('Expected file action');
    }

    const webcontainer = await this.#webcontainer;

    // CRITICAL: Ensure file is written to WORK_DIR for proper integration
    // Convert relative paths to absolute paths within WORK_DIR
    let absoluteFilePath = action.filePath;
    if (!absoluteFilePath.startsWith('/')) {
      absoluteFilePath = nodePath.join(WORK_DIR, action.filePath);
    }
    
    // Ensure the path is within WORK_DIR (security check)
    if (!absoluteFilePath.startsWith(WORK_DIR)) {
      absoluteFilePath = nodePath.join(WORK_DIR, nodePath.basename(action.filePath));
      logger.warn(`File path ${action.filePath} was outside WORK_DIR, relocated to ${absoluteFilePath}`);
    }

    let folder = nodePath.dirname(absoluteFilePath);

    // remove trailing slashes
    folder = folder.replace(/\/+$/g, '');

    let result = '';

    if (folder !== WORK_DIR) {
      try {
        await webcontainer.fs.mkdir(folder, { recursive: true });
        result += `Created directory: ${folder}\n`;
        logger.debug('Created folder', folder);
      } catch (error) {
        result += `Failed to create directory: ${folder} - ${error}\n`;
        logger.error('Failed to create folder\n\n', error);
      }
    }

    try {
      await webcontainer.fs.writeFile(absoluteFilePath, action.content);
      result += `Successfully wrote file: ${absoluteFilePath} (${action.content.length} characters)`;
      logger.debug(`File written ${absoluteFilePath}`);

      // File watcher will automatically detect and add the file to the store
      // Workbench will auto-show when files are detected via the store subscription
      logger.debug(`File will be detected by file watcher: ${absoluteFilePath}`);

    } catch (error) {
      result += `Failed to write file: ${absoluteFilePath} - ${error}`;
      logger.error('Failed to write file\n\n', error);
    }

    // Store the file operation result
    this.#updateAction(actionId, { result: result.trim() });
  }

  async #runMCPToolAction(actionId: string, action: ActionState) {
    if (action.type !== 'mcp-tool') {
      unreachable('Expected MCP tool action');
    }

    try {
      // Parse the content as JSON arguments
      const args = JSON.parse(action.content);
      
      const result = await mcpClientManager.callTool(
        action.serverName,
        action.toolName,
        args
      );

      if (result.success) {
        const toolResult = `MCP Tool: ${action.serverName}.${action.toolName}\nArgs: ${JSON.stringify(args)}\nResult: ${JSON.stringify(result.data)}`;
        this.#updateAction(actionId, { result: toolResult });
        logger.debug(`MCP tool executed successfully: ${action.serverName}.${action.toolName}`);
      } else {
        const errorResult = `MCP Tool: ${action.serverName}.${action.toolName}\nArgs: ${JSON.stringify(args)}\nError: ${result.error}`;
        this.#updateAction(actionId, { result: errorResult });
        logger.error(`MCP tool failed: ${result.error}`);
        throw new Error(result.error || 'MCP tool execution failed');
      }
    } catch (error) {
      const errorResult = `MCP Tool: ${action.serverName}.${action.toolName}\nError: ${error instanceof Error ? error.message : String(error)}`;
      this.#updateAction(actionId, { result: errorResult });
      logger.error('Failed to execute MCP tool\n\n', error);
      throw error;
    }
  }

  #updateAction(id: string, newState: ActionStateUpdate) {
    const actions = this.actions.get();

    this.actions.setKey(id, { ...actions[id], ...newState });
  }
}
