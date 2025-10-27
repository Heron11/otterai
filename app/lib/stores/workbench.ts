import { atom, map, type MapStore, type ReadableAtom, type WritableAtom } from 'nanostores';
import type { EditorDocument, ScrollPosition } from '~/components/editor/codemirror/CodeMirrorEditor';
import { ActionRunner } from '~/lib/runtime/action-runner';
import type { ActionCallbackData, ArtifactCallbackData } from '~/lib/runtime/message-parser';
import { webcontainer } from '~/lib/webcontainer';
import type { ITerminal } from '~/types/terminal';
import { unreachable } from '~/utils/unreachable';
import { EditorStore } from './editor';
import { FilesStore, type FileMap } from './files';
import { PreviewsStore } from './previews';
import { TerminalStore } from './terminal';

export interface ArtifactState {
  id: string;
  title: string;
  closed: boolean;
  runner: ActionRunner;
}

export type ArtifactUpdateState = Pick<ArtifactState, 'title' | 'closed'>;

type Artifacts = MapStore<Record<string, ArtifactState>>;

export type WorkbenchViewType = 'code' | 'preview';

export class WorkbenchStore {
  #previewsStore = new PreviewsStore(webcontainer);
  #filesStore = new FilesStore(webcontainer);
  #editorStore = new EditorStore(this.#filesStore);
  #terminalStore = new TerminalStore(webcontainer);

  artifacts: Artifacts = import.meta.hot?.data.artifacts ?? map({});

  showWorkbench: WritableAtom<boolean> = import.meta.hot?.data.showWorkbench ?? atom(false);
  currentView: WritableAtom<WorkbenchViewType> = import.meta.hot?.data.currentView ?? atom('code');
  unsavedFiles: WritableAtom<Set<string>> = import.meta.hot?.data.unsavedFiles ?? atom(new Set<string>());
  modifiedFiles = new Set<string>();
  artifactIdList: string[] = [];
  
  // Track current project to detect switches
  #currentProjectId: string | null = null;

  constructor() {
    if (import.meta.hot) {
      import.meta.hot.data.artifacts = this.artifacts;
      import.meta.hot.data.unsavedFiles = this.unsavedFiles;
      import.meta.hot.data.showWorkbench = this.showWorkbench;
      import.meta.hot.data.currentView = this.currentView;
    }
  }

  get previews() {
    return this.#previewsStore.previews;
  }

  get files() {
    return this.#filesStore.files;
  }

  get currentDocument(): ReadableAtom<EditorDocument | undefined> {
    return this.#editorStore.currentDocument;
  }

  get selectedFile(): ReadableAtom<string | undefined> {
    return this.#editorStore.selectedFile;
  }

  get firstArtifact(): ArtifactState | undefined {
    return this.#getArtifact(this.artifactIdList[0]);
  }

  get filesCount(): number {
    return this.#filesStore.filesCount;
  }

  get showTerminal() {
    return this.#terminalStore.showTerminal;
  }

  toggleTerminal(value?: boolean) {
    this.#terminalStore.toggleTerminal(value);
  }

  attachTerminal(terminal: ITerminal) {
    this.#terminalStore.attachTerminal(terminal);
  }

  onTerminalResize(cols: number, rows: number) {
    this.#terminalStore.onTerminalResize(cols, rows);
  }

  setDocuments(files: FileMap) {
    this.#editorStore.setDocuments(files);

    if (this.#filesStore.filesCount > 0 && this.currentDocument.get() === undefined) {
      // we find the first file and select it
      for (const [filePath, dirent] of Object.entries(files)) {
        if (dirent?.type === 'file') {
          this.setSelectedFile(filePath);
          break;
        }
      }
    }
  }

  setShowWorkbench(show: boolean) {
    this.showWorkbench.set(show);
  }

  setCurrentDocumentContent(newContent: string) {
    const filePath = this.currentDocument.get()?.filePath;

    if (!filePath) {
      return;
    }

    const originalContent = this.#filesStore.getFile(filePath)?.content;
    const unsavedChanges = originalContent !== undefined && originalContent !== newContent;

    this.#editorStore.updateFile(filePath, newContent);

    const currentDocument = this.currentDocument.get();

    if (currentDocument) {
      const previousUnsavedFiles = this.unsavedFiles.get();

      if (unsavedChanges && previousUnsavedFiles.has(currentDocument.filePath)) {
        return;
      }

      const newUnsavedFiles = new Set(previousUnsavedFiles);

      if (unsavedChanges) {
        newUnsavedFiles.add(currentDocument.filePath);
      } else {
        newUnsavedFiles.delete(currentDocument.filePath);
      }

      this.unsavedFiles.set(newUnsavedFiles);
    }
  }

  setCurrentDocumentScrollPosition(position: ScrollPosition) {
    const editorDocument = this.currentDocument.get();

    if (!editorDocument) {
      return;
    }

    const { filePath } = editorDocument;

    this.#editorStore.updateScrollPosition(filePath, position);
  }

  setSelectedFile(filePath: string | undefined) {
    this.#editorStore.setSelectedFile(filePath);
  }

  async saveFile(filePath: string) {
    const documents = this.#editorStore.documents.get();
    const document = documents[filePath];

    if (document === undefined) {
      return;
    }

    await this.#filesStore.saveFile(filePath, document.value);

    const newUnsavedFiles = new Set(this.unsavedFiles.get());
    newUnsavedFiles.delete(filePath);

    this.unsavedFiles.set(newUnsavedFiles);
  }

  async saveCurrentDocument() {
    const currentDocument = this.currentDocument.get();

    if (currentDocument === undefined) {
      return;
    }

    await this.saveFile(currentDocument.filePath);
  }

  resetCurrentDocument() {
    const currentDocument = this.currentDocument.get();

    if (currentDocument === undefined) {
      return;
    }

    const { filePath } = currentDocument;
    const file = this.#filesStore.getFile(filePath);

    if (!file) {
      return;
    }

    this.setCurrentDocumentContent(file.content);
  }

  async saveAllFiles() {
    for (const filePath of this.unsavedFiles.get()) {
      await this.saveFile(filePath);
    }
  }

  getFileModifcations() {
    return this.#filesStore.getFileModifications();
  }

  resetAllFileModifications() {
    this.#filesStore.resetFileModifications();
  }

  abortAllActions() {
    // TODO: what do we wanna do and how do we wanna recover from this?
  }

  addArtifact({ messageId, title, id }: ArtifactCallbackData) {
    const artifact = this.#getArtifact(messageId);

    if (artifact) {
      return;
    }

    if (!this.artifactIdList.includes(messageId)) {
      this.artifactIdList.push(messageId);
    }

    this.artifacts.setKey(messageId, {
      id,
      title,
      closed: false,
      runner: new ActionRunner(webcontainer),
    });
  }

  updateArtifact({ messageId }: ArtifactCallbackData, state: Partial<ArtifactUpdateState>) {
    const artifact = this.#getArtifact(messageId);

    if (!artifact) {
      return;
    }

    this.artifacts.setKey(messageId, { ...artifact, ...state });
  }

  async addAction(data: ActionCallbackData) {
    const { messageId } = data;

    const artifact = this.#getArtifact(messageId);

    if (!artifact) {
      unreachable('Artifact not found');
    }

    artifact.runner.addAction(data);
  }

  async runAction(data: ActionCallbackData) {
    const { messageId } = data;

    const artifact = this.#getArtifact(messageId);

    if (!artifact) {
      unreachable('Artifact not found');
    }

    artifact.runner.runAction(data);
  }

  /**
   * Reset workbench to clean state
   * Clears all artifacts, files, and state
   */
  async resetWorkbench() {
    // Clear artifacts
    this.artifacts.set({});
    this.artifactIdList = [];
    
    // Hide workbench
    this.showWorkbench.set(false);
    
    // Clear unsaved files
    this.unsavedFiles.set(new Set());
    this.modifiedFiles.clear();
    
    // Reset view to code
    this.currentView.set('code');
    
    // Clear current project ID
    this.#currentProjectId = null;
    
    // Clear previews to prevent showing old project content
    this.#previewsStore.clearPreviews();
    
    // Clear WebContainer filesystem
    try {
      const webcontainerInstance = await webcontainer;
      const WORK_DIR = '/home/project';
      
      // Check if the work directory exists before trying to read it
      try {
        await webcontainerInstance.fs.readdir(WORK_DIR, { withFileTypes: true });
      } catch (readError) {
        // If the directory doesn't exist or can't be read, create it
        console.warn('Work directory not accessible, creating fresh directory:', readError);
        await webcontainerInstance.fs.mkdir(WORK_DIR, { recursive: true });
        return; // Exit early since directory is now clean
      }
      
      // List all files in the work directory
      const files = await webcontainerInstance.fs.readdir(WORK_DIR, { withFileTypes: true });
      
      // Delete all files and directories
      for (const file of files) {
        try {
          const fullPath = `${WORK_DIR}/${file.name}`;
          if (file.isDirectory()) {
            await webcontainerInstance.fs.rm(fullPath, { recursive: true, force: true });
          } else {
            await webcontainerInstance.fs.rm(fullPath, { force: true });
          }
        } catch (err) {
          // Ignore errors for individual file deletions
          console.warn(`Failed to delete ${file.name}:`, err);
        }
      }
    } catch (error) {
      console.error('Failed to clear WebContainer filesystem:', error);
      // Don't throw - this is a cleanup operation and shouldn't break the flow
    }
  }

  /**
   * Load project files directly into the workbench
   * Bypasses message parser and artifact system
   * Automatically clears workbench if switching projects
   */
  async loadProjectFiles(files: Record<string, string>, projectName: string, projectId: string) {
    // Check if we're switching projects
    if (this.#currentProjectId && this.#currentProjectId !== projectId) {
      await this.resetWorkbench();
    }
    
    // Set current project ID
    this.#currentProjectId = projectId;
    
    const webcontainerInstance = await webcontainer;
    
    // Ensure the work directory exists
    const WORK_DIR = '/home/project';
    try {
      await webcontainerInstance.fs.mkdir(WORK_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create work directory:', error);
      throw new Error('Failed to initialize project workspace');
    }
    
    // Create a pseudo-artifact for the project to maintain compatibility
    const artifactId = `project-${Date.now()}`;
    const messageId = `msg-${Date.now()}`;
    
    this.artifactIdList.push(messageId);
    this.artifacts.setKey(messageId, {
      id: artifactId,
      title: projectName,
      closed: false,
      runner: new ActionRunner(webcontainer),
    });

    // Write all files to WebContainer
    let successCount = 0;
    let errorCount = 0;
    
    for (const [filePath, content] of Object.entries(files)) {
      try {
        // Security: Validate and normalize file path to prevent directory traversal
        const normalizedPath = this.#validateAndNormalizePath(filePath);
        if (!normalizedPath) {
          console.warn(`Skipping invalid file path: ${filePath}`);
          errorCount++;
          continue;
        }
        
        // Build full path
        const fullPath = `${WORK_DIR}/${normalizedPath}`;
        const dirPath = fullPath.split('/').slice(0, -1).join('/');
        
        // Create directory if needed
        if (dirPath && dirPath !== WORK_DIR) {
          await webcontainerInstance.fs.mkdir(dirPath, { recursive: true });
        }

        // Write file
        await webcontainerInstance.fs.writeFile(fullPath, content);
        successCount++;
      } catch (error) {
        console.error(`Failed to load file ${filePath}:`, error);
        errorCount++;
      }
    }

    // Log summary
    console.log(`Project files loaded: ${successCount} successful, ${errorCount} failed`);
    
    // Show workbench
    this.showWorkbench.set(true);
  }
  
  /**
   * Check if workbench should be cleared for a fresh start
   * Call this when starting a new chat (not from a project)
   */
  async clearForNewChat() {
    if (this.#currentProjectId !== null || this.filesCount > 0) {
      await this.resetWorkbench();
    }
  }

  #getArtifact(id: string) {
    const artifacts = this.artifacts.get();
    return artifacts[id];
  }

  /**
   * Security: Validate and normalize file path to prevent directory traversal attacks
   * @param filePath - The file path to validate
   * @returns Normalized path or null if invalid
   */
  #validateAndNormalizePath(filePath: string): string | null {
    if (!filePath || typeof filePath !== 'string') {
      return null;
    }

    // Remove leading slash and /home/project prefix if present
    let normalizedPath = filePath.replace(/^\//, '');
    if (normalizedPath.startsWith('home/project/')) {
      normalizedPath = normalizedPath.substring('home/project/'.length);
    }

    // Security: Prevent directory traversal attacks
    if (normalizedPath.includes('..') || normalizedPath.includes('~')) {
      return null;
    }

    // Security: Prevent absolute paths
    if (normalizedPath.startsWith('/')) {
      return null;
    }

    // Security: Prevent control characters and dangerous patterns
    if (/[\x00-\x1f\x7f-\x9f]/.test(normalizedPath)) {
      return null;
    }

    // Security: Limit path length to prevent DoS
    if (normalizedPath.length > 1000) {
      return null;
    }

    // Normalize path separators and remove redundant parts
    normalizedPath = normalizedPath.replace(/\/+/g, '/').replace(/\/$/, '');
    
    return normalizedPath;
  }
}

export const workbenchStore = new WorkbenchStore();
