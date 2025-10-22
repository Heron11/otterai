import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Documentation - OtterAI' },
    { name: 'description', content: 'Documentation and guides for OtterAI' },
  ];
};

export async function loader({}: LoaderFunctionArgs) {
  try {
    console.log('[docs._index] Loading all docs...');
    const { getAllDocs } = await import('~/lib/content/docs');
    const docs = getAllDocs();
    console.log('[docs._index] Loaded docs count:', docs.length);
    return json({ docs });
  } catch (error) {
    console.error('[docs._index] Error loading docs:', error);
    console.error('[docs._index] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return json({ docs: [] });
  }
}

const ICON_MAP: Record<string, JSX.Element> = {
  document: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  lock: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

export default function DocsIndexPage() {
  const { docs } = useLoaderData<typeof loader>();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/lightmodelogonew.svg"
                alt="OtterAI"
                style={{ width: '90px', height: 'auto' }}
              />
            </Link>
            <Link
              to="/"
              className="text-sm text-slate-600 hover:text-[#e86b47] transition-colors font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
            Documentation
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to know about using OtterAI
          </p>
        </motion.div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {docs && docs.length > 0 ? docs.map((doc, index) => (
            <motion.div
              key={doc.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={`/docs/${doc.slug}`}
                className="block h-full bg-white border border-slate-200 rounded-xl p-6 hover:border-[#e86b47] hover:shadow-xl hover:shadow-[#e86b47]/5 transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#e86b47]/10 rounded-lg flex items-center justify-center text-[#e86b47] group-hover:bg-[#e86b47] group-hover:text-white transition-all duration-300">
                      {ICON_MAP[doc.metadata.icon] || ICON_MAP.document}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#e86b47] transition-colors">
                      {doc.metadata.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {doc.metadata.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-[#e86b47] font-medium">
                  Read document
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          )) : (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4 opacity-30">📄</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No documentation available
              </h3>
              <p className="text-slate-600">
                Documentation files are being loaded...
              </p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Need Help?
            </h2>
            <p className="text-slate-600 mb-6">
              If you have any questions or need assistance, our support team is here to help.
            </p>
            <a
              href="mailto:help@otterai.net"
              className="inline-flex items-center px-6 py-3 bg-[#e86b47] text-white rounded-lg font-medium hover:bg-[#d45a36] hover:shadow-lg hover:shadow-[#e86b47]/20 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}