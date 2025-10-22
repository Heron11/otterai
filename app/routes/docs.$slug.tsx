import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect } from 'react';

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

  try {
    console.log(`[docs.$slug] Loading doc for slug: ${slug}`);
    const { getAllDocs, getDocBySlug } = await import('~/lib/content/docs');

    const doc = getDocBySlug(slug);
    const allDocs = getAllDocs();
    
    console.log(`[docs.$slug] Doc loaded:`, doc ? 'yes' : 'no');
    console.log(`[docs.$slug] All docs count:`, allDocs.length);
    
    if (!doc) {
      console.log(`[docs.$slug] Doc not found for slug: ${slug}`);
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
  } catch (error) {
    console.error(`[docs.$slug] Error loading doc for slug ${slug}:`, error);
    console.error(`[docs.$slug] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    
    // Re-throw Response errors (404)
    if (error instanceof Response) {
      throw error;
    }
    
    throw new Response('Internal Server Error', { status: 500 });
  }
}

export default function DocPage() {
  const { doc, slug, availableDocs } = useLoaderData<typeof loader>();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-2">
              <img
                src="/lightmodelogonew.svg"
                alt="OtterAI"
                className="h-8"
              />
            </a>
            <a
              href="/"
              className="text-sm text-slate-600 hover:text-[#e86b47] transition-colors font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-3">
            <nav className="sticky top-24 space-y-1">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Documentation
              </h3>
              {availableDocs.map((docItem) => (
                <a
                  key={docItem.slug}
                  href={`/docs/${docItem.slug}`}
                  className={`
                    block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${slug === docItem.slug 
                      ? 'bg-[#e86b47] text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
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
              className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e86b47] focus:border-transparent"
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 lg:p-12">
              {/* Header */}
              <div className="mb-8 pb-8 border-b border-slate-200">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  {doc.metadata.title}
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Last updated: {new Date(doc.metadata.lastUpdated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Document Content */}
              <div className="markdown-content">
                <style dangerouslySetInnerHTML={{__html: `
                  .markdown-content {
                    font-size: 16px;
                    line-height: 1.7;
                    color: #475569;
                  }
                  
                  /* Headings */
                  .markdown-content h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-top: 2rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 2px solid #e2e8f0;
                    letter-spacing: -0.02em;
                  }
                  
                  .markdown-content h2 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-top: 3rem;
                    margin-bottom: 1.25rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    letter-spacing: -0.01em;
                  }
                  
                  .markdown-content h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                  }
                  
                  .markdown-content h4 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #334155;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                  }
                  
                  /* Paragraphs */
                  .markdown-content p {
                    margin-bottom: 1.25rem;
                    color: #475569;
                    line-height: 1.8;
                  }
                  
                  .markdown-content p strong {
                    color: #0f172a;
                    font-weight: 600;
                  }
                  
                  .markdown-content p em {
                    font-style: italic;
                    color: #334155;
                  }
                  
                  /* Links */
                  .markdown-content a {
                    color: #e86b47;
                    font-weight: 500;
                    text-decoration: none;
                    border-bottom: 1px solid transparent;
                    transition: all 0.2s ease;
                  }
                  
                  .markdown-content a:hover {
                    border-bottom-color: #e86b47;
                    color: #d45a36;
                  }
                  
                  /* Lists */
                  .markdown-content ul,
                  .markdown-content ol {
                    margin: 1.5rem 0;
                    padding-left: 1.75rem;
                  }
                  
                  .markdown-content ul {
                    list-style-type: none;
                  }
                  
                  .markdown-content ul li {
                    position: relative;
                    padding-left: 1.5rem;
                    margin-bottom: 0.75rem;
                    color: #475569;
                    line-height: 1.7;
                  }
                  
                  .markdown-content ul li::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 0.65em;
                    width: 6px;
                    height: 6px;
                    background: #e86b47;
                    border-radius: 50%;
                  }
                  
                  .markdown-content ol {
                    counter-reset: item;
                  }
                  
                  .markdown-content ol li {
                    counter-increment: item;
                    padding-left: 1.5rem;
                    margin-bottom: 0.75rem;
                    color: #475569;
                    line-height: 1.7;
                    position: relative;
                  }
                  
                  .markdown-content ol li::before {
                    content: counter(item) ".";
                    position: absolute;
                    left: 0;
                    color: #e86b47;
                    font-weight: 600;
                  }
                  
                  /* Nested Lists */
                  .markdown-content ul ul,
                  .markdown-content ol ul,
                  .markdown-content ul ol,
                  .markdown-content ol ol {
                    margin: 0.5rem 0;
                  }
                  
                  /* Code */
                  .markdown-content code {
                    background: #f1f5f9;
                    color: #e86b47;
                    padding: 0.2em 0.4em;
                    border-radius: 0.375rem;
                    font-size: 0.9em;
                    font-family: 'Monaco', 'Courier New', monospace;
                    font-weight: 500;
                    border: 1px solid #e2e8f0;
                  }
                  
                  .markdown-content pre {
                    background: #1e293b;
                    color: #e2e8f0;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    overflow-x: auto;
                    margin: 1.5rem 0;
                    border: 1px solid #334155;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                  }
                  
                  .markdown-content pre code {
                    background: transparent;
                    color: #e2e8f0;
                    padding: 0;
                    border: none;
                    font-size: 0.875rem;
                    line-height: 1.7;
                  }
                  
                  /* Blockquotes */
                  .markdown-content blockquote {
                    border-left: 4px solid #e86b47;
                    background: linear-gradient(to right, #fef2f2, #fff);
                    padding: 1rem 1.5rem;
                    margin: 1.5rem 0;
                    border-radius: 0 0.5rem 0.5rem 0;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                  }
                  
                  .markdown-content blockquote p {
                    color: #334155;
                    font-style: italic;
                    margin: 0;
                  }
                  
                  .markdown-content blockquote p:first-child::before {
                    content: """;
                    color: #e86b47;
                    font-size: 1.5em;
                    font-weight: bold;
                    margin-right: 0.25rem;
                  }
                  
                  /* Tables */
                  .markdown-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5rem 0;
                    border-radius: 0.5rem;
                    overflow: hidden;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                  }
                  
                  .markdown-content thead {
                    background: linear-gradient(135deg, #e86b47, #d45a36);
                  }
                  
                  .markdown-content th {
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    color: white;
                    border-bottom: 2px solid #d45a36;
                  }
                  
                  .markdown-content td {
                    padding: 1rem;
                    border-bottom: 1px solid #e2e8f0;
                    color: #475569;
                  }
                  
                  .markdown-content tbody tr {
                    background: white;
                    transition: background 0.2s ease;
                  }
                  
                  .markdown-content tbody tr:hover {
                    background: #f8fafc;
                  }
                  
                  .markdown-content tbody tr:last-child td {
                    border-bottom: none;
                  }
                  
                  /* Images */
                  .markdown-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.75rem;
                    margin: 1.5rem 0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    border: 1px solid #e2e8f0;
                  }
                  
                  /* Horizontal Rule */
                  .markdown-content hr {
                    border: none;
                    height: 2px;
                    background: linear-gradient(to right, transparent, #e2e8f0, transparent);
                    margin: 3rem 0;
                  }
                  
                  /* Task Lists */
                  .markdown-content input[type="checkbox"] {
                    margin-right: 0.5rem;
                    width: 1.1em;
                    height: 1.1em;
                    accent-color: #e86b47;
                    cursor: pointer;
                  }
                  
                  /* Definitions */
                  .markdown-content dl {
                    margin: 1.5rem 0;
                  }
                  
                  .markdown-content dt {
                    font-weight: 600;
                    color: #0f172a;
                    margin-top: 1rem;
                  }
                  
                  .markdown-content dd {
                    margin-left: 1.5rem;
                    margin-top: 0.5rem;
                    color: #475569;
                  }
                  
                  /* Footnotes */
                  .markdown-content sup {
                    color: #e86b47;
                    font-weight: 600;
                  }
                  
                  .markdown-content .footnotes {
                    margin-top: 3rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e2e8f0;
                    font-size: 0.875rem;
                  }
                  
                  /* Keyboard Keys */
                  .markdown-content kbd {
                    background: #f1f5f9;
                    border: 1px solid #cbd5e1;
                    border-bottom-width: 2px;
                    border-radius: 0.375rem;
                    padding: 0.125rem 0.375rem;
                    font-size: 0.875em;
                    font-family: monospace;
                    box-shadow: inset 0 -1px 0 0 #cbd5e1;
                  }
                  
                  /* Alerts/Callouts */
                  .markdown-content .alert {
                    padding: 1rem 1.5rem;
                    border-radius: 0.5rem;
                    margin: 1.5rem 0;
                    border-left: 4px solid;
                  }
                  
                  .markdown-content .alert-info {
                    background: #eff6ff;
                    border-color: #3b82f6;
                    color: #1e40af;
                  }
                  
                  .markdown-content .alert-warning {
                    background: #fffbeb;
                    border-color: #f59e0b;
                    color: #92400e;
                  }
                  
                  .markdown-content .alert-success {
                    background: #f0fdf4;
                    border-color: #10b981;
                    color: #065f46;
                  }
                  
                  .markdown-content .alert-error {
                    background: #fef2f2;
                    border-color: #ef4444;
                    color: #991b1b;
                  }
                `}} />
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {doc.content}
                </ReactMarkdown>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Need Help?
                  </h3>
                  <p className="text-slate-600 mb-4">
                    If you have any questions about this document, please don't hesitate to contact us.
                  </p>
                  <a
                    href="mailto:help@otterai.net"
                    className="inline-flex items-center px-4 py-2 bg-[#e86b47] text-white rounded-lg font-medium hover:bg-[#d45a36] hover:shadow-lg hover:shadow-[#e86b47]/20 transition-all duration-300"
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
  );
}
