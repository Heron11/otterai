import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { nanoid } from 'nanoid';

// Simple ID generator
function generateId() {
  return `proj_${nanoid()}`;
}

// Template definitions with embedded file content
const TEMPLATES = {
  'react-todo': {
    name: 'React Todo App',
    description: 'A complete React TodoMVC application with modern styling',
    framework: 'react',
    category: 'productivity',
    files: {
      'package.json': JSON.stringify({
        "name": "react-todo-app",
        "version": "1.0.0",
        "description": "A React TodoMVC application",
        "main": "src/index.js",
        "scripts": {
          "dev": "vite",
          "build": "vite build",
          "preview": "vite preview"
        },
        "dependencies": {
          "react": "^18.2.0",
          "react-dom": "^18.2.0"
        },
        "devDependencies": {
          "@types/react": "^18.2.0",
          "@types/react-dom": "^18.2.0",
          "@vitejs/plugin-react": "^4.0.0",
          "vite": "^4.4.0"
        }
      }, null, 2),
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Todo App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
      'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
      'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
      'src/App.jsx': `import React, { useState } from 'react'
import TodoItem from './components/TodoItem'
import './App.css'

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build a Todo App', completed: false },
    { id: 3, text: 'Deploy to production', completed: false }
  ])
  const [newTodo, setNewTodo] = useState('')

  const addTodo = (e) => {
    e.preventDefault()
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo,
        completed: false
      }])
      setNewTodo('')
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length

  return (
    <div className="app">
      <div className="container">
        <h1>Todo App</h1>
        
        <form onSubmit={addTodo} className="todo-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="What needs to be done?"
            className="todo-input"
          />
          <button type="submit" className="add-button">Add</button>
        </form>

        <div className="todo-stats">
          <span>{completedCount} of {totalCount} completed</span>
        </div>

        <div className="todo-list">
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
        </div>

        {todos.length === 0 && (
          <div className="empty-state">
            <p>No todos yet. Add one above!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App`,
      'src/components/TodoItem.jsx': `import React from 'react'

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className={\`todo-item \${todo.completed ? 'completed' : ''}\`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="todo-checkbox"
      />
      <span className="todo-text">{todo.text}</span>
      <button
        onClick={() => onDelete(todo.id)}
        className="delete-button"
        aria-label="Delete todo"
      >
        ×
      </button>
    </div>
  )
}

export default TodoItem`,
      'src/App.css': `/* App.css */
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

h1 {
  text-align: center;
  color: #333;
  margin: 0;
  padding: 30px 20px 20px;
  font-size: 2.5rem;
  font-weight: 300;
}

.todo-form {
  display: flex;
  padding: 20px;
  gap: 10px;
  border-bottom: 1px solid #eee;
}

.todo-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.todo-input:focus {
  outline: none;
  border-color: #667eea;
}

.add-button {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-button:hover {
  background: #5a6fd8;
}

.todo-stats {
  padding: 15px 20px;
  background: #f8f9fa;
  color: #666;
  font-size: 14px;
  border-bottom: 1px solid #eee;
}

.todo-list {
  max-height: 400px;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.todo-item:hover {
  background: #f8f9fa;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-checkbox {
  margin-right: 12px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.delete-button {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.delete-button:hover {
  background: #ff3742;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}`,
      'src/index.css': `/* Global styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`
    }
  }
};

export async function action(args: ActionFunctionArgs) {
  const { request, context } = args;
  
  // Import server-only modules inside the function
  const { getOptionalUserId } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase, execute } = await import('~/lib/.server/db/client');
  
  // Ensure Clerk can read the session by passing the original args
  const userId = await getOptionalUserId(args);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json() as { templateId: string; newProjectName: string };
  const { templateId, newProjectName } = body;

  if (!templateId || !newProjectName) {
    throw new Response('Template ID and new project name are required', { status: 400 });
  }

  // Check if template exists
  const template = TEMPLATES[templateId as keyof typeof TEMPLATES];
  if (!template) {
    throw new Response('Template not found', { status: 404 });
  }

  const db = getDatabase(context.cloudflare.env);
  const r2Bucket = context.cloudflare.env.R2_BUCKET;
  if (!r2Bucket) {
    throw new Response('Storage not configured', { status: 500 });
  }
  
  try {
    // Rate limiting: Check recent clones by this user
    const isDevelopment = process.env.NODE_ENV === 'development' || context.cloudflare.env.ENVIRONMENT === 'development';
    const disableRateLimit = context.cloudflare.env.DISABLE_RATE_LIMIT === 'true';
    
    if (!disableRateLimit) {
      const maxClones = isDevelopment ? 10 : 3;
      const timeWindow = isDevelopment ? 1 : 5;
      
      const recentClones = await db.prepare(
        `SELECT COUNT(*) as count FROM projects 
         WHERE user_id = ? AND created_at > datetime('now', '-${timeWindow} minutes')`
      ).bind(userId).first<{ count: number }>();

      if (recentClones && recentClones.count >= maxClones) {
        const timeMessage = isDevelopment ? '1 minute' : '5 minutes';
        throw new Response(`Rate limit exceeded. Please wait ${timeMessage} before cloning more templates.`, { 
          status: 429 
        });
      }
    }

    // Get template files
    const templateFiles = template.files;

    if (Object.keys(templateFiles).length === 0) {
      throw new Response('Template files not found', { status: 404 });
    }

    // Create new project
    const newProjectId = generateId();
    const newR2Path = `projects/${newProjectId}`;
    const now = new Date().toISOString();

    // Calculate total size
    const totalSize = Object.values(templateFiles).reduce((sum, content) => sum + content.length, 0);

    await execute(
      db,
      `INSERT INTO projects (id, user_id, name, description, visibility, r2_path, created_at, updated_at, view_count, clone_count, status, file_count, total_size, template_id, template_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      newProjectId,
      userId,
      newProjectName,
      `Created from ${template.name} template`,
      'private', // New projects start as private
      newR2Path,
      now,
      now,
      0, // view_count
      0, // clone_count
      'active', // status
      Object.keys(templateFiles).length,
      totalSize,
      templateId, // template_id
      template.name // template_name
    );

    // Upload files to R2 storage
    let uploadedFiles = 0;
    for (const [filePath, content] of Object.entries(templateFiles)) {
      try {
        // Determine content type
        const contentType = getContentType(filePath);
        
        // Create R2 key
        const r2Key = `${newR2Path}/${filePath}`;
        
        // Upload to R2
        await r2Bucket.put(r2Key, content, {
          httpMetadata: {
            contentType,
          },
          customMetadata: {
            projectId: newProjectId,
            userId,
            filePath,
            uploadedAt: now,
          },
        });

        // Create file record in database
        await execute(
          db,
          `INSERT INTO project_files (project_id, user_id, file_path, r2_key, file_size, content_type)
           VALUES (?, ?, ?, ?, ?, ?)`,
          newProjectId,
          userId,
          filePath,
          r2Key,
          content.length,
          contentType
        );

        uploadedFiles++;
      } catch (error) {
        console.error('Failed to upload template file:', error);
      }
    }

    return json({ 
      success: true, 
      project: { 
        id: newProjectId, 
        name: newProjectName, 
        created_at: now,
        file_count: uploadedFiles,
        template_name: template.name
      },
      message: `Successfully created "${newProjectName}" from ${template.name} template with ${uploadedFiles} files`
    });
  } catch (error) {
    console.error('Error cloning template:', error);
    if (error instanceof Response) {
      throw error;
    }
    throw new Response('Failed to clone template. Please try again.', { status: 500 });
  }
}

/**
 * Determine content type based on file extension
 */
function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  
  const contentTypes: Record<string, string> = {
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'jsx': 'application/javascript',
    'ts': 'application/typescript',
    'tsx': 'application/typescript',
    'json': 'application/json',
    'md': 'text/markdown',
    'txt': 'text/plain',
    'xml': 'application/xml',
    'svg': 'image/svg+xml',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'ico': 'image/x-icon',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'eot': 'application/vnd.ms-fontobject',
  };
  
  return contentTypes[ext || ''] || 'text/plain';
}