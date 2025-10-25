/**
 * GitHub utilities for client-side use
 */

export interface GitHubFile {
  path: string;
  content: string;
  type: 'file' | 'dir';
}

// convertToWebContainerFormat removed - no longer needed
// Files are now written directly to working directory via WebContainer.fs.writeFile()

/**
 * Fetch GitHub repository files from client-side
 * This calls our server API endpoint to avoid CORS issues
 */
export async function fetchGithubRepoFiles(githubUrl: string): Promise<GitHubFile[]> {
  const response = await fetch('/api/fetch-github-repo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ githubUrl }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repository: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Generate fallback files for a template
 */
export function generateFallbackFiles(template: any): GitHubFile[] {
  return [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: template.name.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: template.description,
        main: 'index.js',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          start: 'vite preview'
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        },
        devDependencies: {
          vite: '^4.0.0',
          '@vitejs/plugin-react': '^4.0.0'
        }
      }, null, 2),
      type: 'file'
    },
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${template.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
      type: 'file'
    },
    {
      path: 'src/main.jsx',
      content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
      type: 'file'
    },
    {
      path: 'src/App.jsx',
      content: `import React from 'react'

function App() {
  return (
    <div>
      <h1>${template.name}</h1>
      <p>${template.description}</p>
      <p>Template loaded successfully! Start building your app.</p>
    </div>
  )
}

export default App`,
      type: 'file'
    }
  ];
}