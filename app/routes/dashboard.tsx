import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/cloudflare';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { ProjectGrid } from '~/components/platform/projects/ProjectGrid';
import { TIER_LIMITS } from '~/lib/utils/tier-limits';

export const meta: MetaFunction = () => {
  return [
    { title: 'Dashboard - OtterAI' },
    { name: 'description', content: 'Your OtterAI dashboard' },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  try {
    const { request, context } = args;
    
    // Import server-only modules inside the function
    const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
    const { getDatabase } = await import('~/lib/.server/db/client');
    const { getUserProfile, getUserCredits } = await import('~/lib/.server/users/queries');
    const { getRecentProjects, getFeaturedProjects } = await import('~/lib/.server/projects/queries');
    
    const auth = await requireAuth(args);
    const db = getDatabase(context.cloudflare.env);

    const [userProfile, creditInfo, recentProjects, featuredTemplates] = await Promise.all([
      getUserProfile(db, auth.userId!),
      getUserCredits(db, auth.userId!),
      getRecentProjects(db, auth.userId!, 4),
      getFeaturedProjects(db, 3),
    ]);

    console.log(`Dashboard loader: User ${auth.userId}, ${recentProjects.length} recent projects, ${featuredTemplates.length} featured templates`);
    return json({
      userProfile,
      creditInfo,
      recentProjects,
      featuredTemplates,
    });
  } catch (error) {
    console.error('Dashboard loader error:', error);
    // Return minimal data instead of throwing to prevent page crash
    return json({
      userProfile: null,
      creditInfo: null,
      recentProjects: [],
      featuredTemplates: [],
    });
  }
}

export default function DashboardPage() {
  const { userProfile, creditInfo, recentProjects, featuredTemplates } = useLoaderData<typeof loader>();
  
  const tierLimits = userProfile ? TIER_LIMITS[userProfile.tier] : null;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <PlatformLayout>
      <div className="min-h-screen bg-bg-1 dark:bg-black overflow-x-hidden">
        {/* Background decorative elements - safe positioning */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#e86b47]/5 dark:bg-[#e86b47]/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-20 w-64 h-64 bg-[#e86b47]/4 dark:bg-[#e86b47]/6 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-[#e86b47]/3 dark:bg-[#e86b47]/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Welcome Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-20 text-center"
          >
            <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl text-text-primary dark:text-white tracking-tight mb-6 font-light break-words">
              Welcome back, <span className="font-semibold text-[#e86b47]">{userProfile?.name}</span>
            </h1>
            <p className="text-lg text-text-secondary dark:text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Ready to build something amazing? Choose from templates or start fresh with AI assistance.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-[#e86b47]/20 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-[#e86b47] rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-[#e86b47]">
                {tierLimits?.name} Plan
              </span>
              <div className="w-px h-4 bg-[#e86b47]/30"></div>
              <span className="text-xs text-text-tertiary dark:text-white/60 font-medium">
                {creditInfo?.credits || 0}/{tierLimits?.creditsPerMonth || 0} messages
              </span>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20"
          >
            <Link
              to="/"
              className="group relative overflow-hidden bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-neutral-200/50 dark:border-white/10 rounded-2xl p-8 hover:border-[#e86b47]/30 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
            >
              <div className="relative z-10">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#e86b47] to-[#d45a36] rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    ✨
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-text-primary dark:text-white mb-2 group-hover:text-[#e86b47] transition-colors duration-300">
                      Start from Scratch
                    </h3>
                    <p className="text-sm text-text-secondary dark:text-white/70 leading-relaxed">
                      Create a new project with AI assistance and watch your ideas come to life instantly.
                    </p>
                  </div>
                </div>
              </div>
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#e86b47]/10 to-transparent dark:from-[#e86b47]/15 dark:to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#e86b47]/5 dark:to-[#e86b47]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </Link>

            <Link
              to="/templates"
              className="group relative overflow-hidden bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-neutral-200/50 dark:border-white/10 rounded-2xl p-8 hover:border-[#e86b47]/30 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
            >
              <div className="relative z-10">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#e86b47] to-[#d45a36] rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    📦
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-text-primary dark:text-white mb-2 group-hover:text-[#e86b47] transition-colors duration-300">
                      Browse Templates
                    </h3>
                    <p className="text-sm text-text-secondary dark:text-white/70 leading-relaxed">
                      Start with a professional template and customize it to match your vision perfectly.
                    </p>
                  </div>
                </div>
              </div>
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#e86b47]/10 to-transparent dark:from-[#e86b47]/15 dark:to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#e86b47]/5 dark:to-[#e86b47]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </Link>
          </motion.div>

          {/* Recent Projects */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="mb-20"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-heading text-3xl lg:text-4xl text-text-primary dark:text-white tracking-tight mb-2">
                  Recent Projects
                </h2>
                <p className="text-text-secondary dark:text-white/70">
                  Continue working on your latest creations
                </p>
              </div>
              <Link
                to="/projects"
                className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#e86b47] hover:text-white transition-all duration-300 bg-white/60 dark:bg-white/10 hover:bg-[#e86b47] border border-[#e86b47]/20 hover:border-[#e86b47] rounded-xl backdrop-blur-sm shadow-sm hover:shadow-lg"
              >
                View all
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <ProjectGrid
              projects={recentProjects}
              emptyMessage="No projects yet. Create your first project to get started!"
              showSettings={true}
            />
          </motion.div>

          {/* Featured Templates */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-heading text-3xl lg:text-4xl text-text-primary dark:text-white tracking-tight mb-2">
                  Featured Templates
                </h2>
                <p className="text-text-secondary dark:text-white/70">
                  Discover popular templates to jumpstart your projects
                </p>
              </div>
              <Link
                to="/templates"
                className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#e86b47] hover:text-white transition-all duration-300 bg-white/60 dark:bg-white/10 hover:bg-[#e86b47] border border-[#e86b47]/20 hover:border-[#e86b47] rounded-xl backdrop-blur-sm shadow-sm hover:shadow-lg"
              >
                View all
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <ProjectGrid projects={featuredTemplates} showSettings={false} />
          </motion.div>
        </div>
      </div>
    </PlatformLayout>
  );
}



