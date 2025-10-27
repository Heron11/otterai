import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

export async function loader({ context }: LoaderFunctionArgs) {
  // Import server-only modules inside the function
  const { getDatabase } = await import('~/lib/.server/db/client');
  const { getPublicTemplates, getFeaturedProjects } = await import('~/lib/.server/projects/queries');
  
  const db = getDatabase(context.cloudflare.env);
  
  try {
    // Get public templates using the proper query functions
    const publicProjects = await getPublicTemplates(db, 50);
    const featuredProjects = await getFeaturedProjects(db, 6);

    return json({
      publicProjects,
      featuredProjects,
      total: publicProjects.length
    });
  } catch (error) {
    console.error('Error fetching public templates:', error);
    throw new Response('Internal Server Error', { status: 500 });
  }
}
