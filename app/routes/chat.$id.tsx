import { redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';

export async function loader(args: LoaderFunctionArgs) {
  // Legacy chat URLs - redirect to build page for a fresh start
  // The new project-based architecture uses /project/:id instead
  return redirect('/');
}
