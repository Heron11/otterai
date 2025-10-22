import JSZip from 'jszip';
import type { FileMap } from '~/lib/stores/files';

/**
 * Creates a ZIP file from the project files
 */
export async function createProjectZip(files: FileMap, projectName: string): Promise<Blob> {
  const zip = new JSZip();
  
  // Iterate through all files and add them to the zip
  Object.entries(files).forEach(([path, dirent]) => {
    if (dirent && dirent.type === 'file' && !dirent.isBinary) {
      // Add text files with their content
      zip.file(path, dirent.content);
    }
    // Folders are created automatically when files are added with paths
  });
  
  // Generate the ZIP file as a blob
  return await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6 // Balance between speed and compression
    }
  });
}

/**
 * Triggers a browser download for a blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 100);
}


