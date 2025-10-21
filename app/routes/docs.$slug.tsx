import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: 'Not Found - OtterAI' }];
  }
  
  return [
    { title: `${data.doc.metadata.title} - OtterAI` },
    { name: 'description', content: data.doc.metadata.description },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  
  if (!slug) {
    throw new Response('Not Found', { status: 404 });
  }

  // Dynamic import to ensure server-only code
  const { getAllDocs, getDocBySlug } = await import('~/lib/content/docs.server');

  const [doc, allDocs] = await Promise.all([
    getDocBySlug(slug),
    getAllDocs(),
  ]);
  
  if (!doc) {
    throw new Response('Not Found', { status: 404 });
  }
  
  return json({ 
    doc,
    slug,
    availableDocs: allDocs.map(d => ({
      slug: d.slug,
      title: d.metadata.title,
    })),
  });
}

export default function DocPage() {
  const { doc, slug, availableDocs } = useLoaderData<typeof loader>();
  
  return (
    <PlatformLayout>
      <div className="min-h-screen bg-bolt-elements-background-depth-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Sidebar Navigation */}
            <aside className="hidden lg:block lg:col-span-3">
              <nav className="sticky top-24 space-y-1">
                <h3 className="px-3 text-xs font-semibold text-bolt-elements-textSecondary uppercase tracking-wider mb-3">
                  Documentation
                </h3>
                {availableDocs.map((docItem) => (
                  <a
                    key={docItem.slug}
                    href={`/docs/${docItem.slug}`}
                    className={`
                      block px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${slug === docItem.slug 
                        ? 'bg-[#e86b47] text-white' 
                        : 'text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2'
                      }
                    `}
                  >
                    {docItem.title}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Mobile Navigation */}
            <div className="lg:hidden mb-8">
              <label htmlFor="docs-select" className="sr-only">
                Select a document
              </label>
              <select
                id="docs-select"
                value={slug}
                onChange={(e) => window.location.href = `/docs/${e.target.value}`}
                className="block w-full px-4 py-2 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-[#e86b47]"
              >
                {availableDocs.map((docItem) => (
                  <option key={docItem.slug} value={docItem.slug}>
                    {docItem.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Content */}
            <main className="lg:col-span-9">
              <div className="bg-bolt-elements-background-depth-2 rounded-2xl border border-bolt-elements-borderColor p-8 lg:p-12">
                {/* Header */}
                <div className="mb-8 pb-8 border-b border-bolt-elements-borderColor">
                  <h1 className="text-4xl font-bold text-bolt-elements-textPrimary mb-3">
                    {doc.metadata.title}
                  </h1>
                  <p className="text-sm text-bolt-elements-textSecondary">
                    Last updated: {new Date(doc.metadata.lastUpdated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Document Content */}
                <div className="prose prose-invert max-w-none prose-headings:text-bolt-elements-textPrimary prose-p:text-bolt-elements-textSecondary prose-a:text-[#e86b47] prose-strong:text-bolt-elements-textPrimary prose-li:text-bolt-elements-textSecondary prose-ul:text-bolt-elements-textSecondary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {doc.content}
                  </ReactMarkdown>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-bolt-elements-borderColor">
                  <div className="bg-bolt-elements-background-depth-1 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-2">
                      Need Help?
                    </h3>
                    <p className="text-bolt-elements-textSecondary mb-4">
                      If you have any questions about this document, please don't hesitate to contact us.
                    </p>
                    <a
                      href="mailto:help@otterai.net"
                      className="inline-flex items-center px-4 py-2 bg-[#e86b47] text-white rounded-lg font-medium hover:bg-[#d45a36] transition-colors"
                    >
                      Contact Support
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}

