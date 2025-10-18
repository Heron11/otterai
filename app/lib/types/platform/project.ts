export type ProjectStatus = 'active' | 'archived' | 'deleted';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  templateId?: string;
  templateName?: string;
  status: ProjectStatus;
  lastModified: Date;
  createdAt: Date;
  files?: ProjectFiles;
  previewUrl?: string;
}

export interface ProjectFiles {
  [path: string]: {
    content: string;
    type: string;
  };
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  templateId?: string;
  fromScratch?: boolean;
}



