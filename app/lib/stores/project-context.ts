/**
 * Project Context Store
 * Tracks the currently active project
 */

import { atom, type WritableAtom } from 'nanostores';

export interface ProjectContext {
  projectId: string;
  projectName: string;
}

export const currentProject: WritableAtom<ProjectContext | null> = atom(null);

export function setCurrentProject(context: ProjectContext | null) {
  currentProject.set(context);
}

export function getCurrentProject(): ProjectContext | null {
  return currentProject.get();
}

export function clearCurrentProject() {
  currentProject.set(null);
}

