import { json } from '@remix-run/cloudflare';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { staticTemplateData } from '~/lib/templates-data';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const templatePath = body?.templatePath;
    
    console.log('📋 API: Request for template:', templatePath);
    
    if (!templatePath || typeof templatePath !== 'string') {
      return json({ error: 'Template path is required' }, { status: 400 });
    }

    // Security: Only allow alphanumeric and hyphens
    if (!templatePath.match(/^[a-zA-Z0-9-_]+$/)) {
      return json({ error: 'Invalid template path' }, { status: 400 });
    }

    // Get template files from static data
    const files = staticTemplateData[templatePath];
    
    if (!files) {
      return json({ error: `Template not found: ${templatePath}` }, { status: 404 });
    }

    console.log(`📋 API: Successfully loaded ${files.length} files from static data`);
    
    return json(files);

  } catch (error) {
    console.error('📋 API: Error loading template:', error);
    return json({ 
      error: 'Failed to load template files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
