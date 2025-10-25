import { json, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { PlatformNav } from '~/components/platform/layout/PlatformNav';
import { FloatingUser } from '~/components/platform/layout/FloatingUser';
import { getTemplateById } from '~/lib/mock/templates';
import { fetchGithubRepoFiles } from '~/lib/utils/github.server';

export const meta: MetaFunction = () => {
  return [{ title: 'OtterAI - AI App Builder' }, { name: 'description', content: 'Build web applications with AI-powered development' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const templateId = url.searchParams.get('template');
  
  if (templateId) {
    const template = getTemplateById(templateId);
    if (template) {
      try {
        // Fetch template files from GitHub repository
        let templateFiles;
        
        try {
          console.log('Fetching template files from:', template.githubUrl);
          templateFiles = await fetchGithubRepoFiles(template.githubUrl);
          
          // If no files were fetched, fall back to placeholder
          if (!templateFiles || templateFiles.length === 0) {
            throw new Error('No files fetched from repository');
          }
          
          console.log('Successfully fetched', templateFiles.length, 'files from GitHub');
        } catch (error) {
          console.warn('Failed to fetch from GitHub, using placeholder files:', error);
          
          // Fallback placeholder files if GitHub fetch fails
          templateFiles = [
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
              type: 'file' as const
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
              type: 'file' as const
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
              type: 'file' as const
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
              type: 'file' as const
            }
          ];
        }
        
        return json({ 
          templateId, 
          template, 
          templateFiles,
          hasTemplate: true 
        });
      } catch (error) {
        console.error('Failed to load template:', error);
        return json({ 
          templateId, 
          template, 
          templateFiles: null,
          hasTemplate: true,
          error: 'Failed to load template files' 
        });
      }
    }
  }
  
  return json({ hasTemplate: false });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="flex flex-col h-full w-full bg-bg-3 dark:bg-black">
      <PlatformNav />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat templateData={data} />}</ClientOnly>
      <FloatingUser />
    </div>
  );
}
