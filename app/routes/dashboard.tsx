import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { motion } from 'framer-motion';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { ProjectGrid } from '~/components/platform/projects/ProjectGrid';
import { TemplateGrid } from '~/components/platform/templates/TemplateGrid';
import { useUser } from '~/lib/hooks/platform/useUser';
import { useStore } from '@nanostores/react';
import { projectsStore, deleteProject } from '~/lib/stores/platform/projects';
import { mockTemplates, getFeaturedTemplates } from '~/lib/mock/templates';

export const meta: MetaFunction = () => {
  return [
    { title: 'Dashboard - OtterAI' },
    { name: 'description', content: 'Your OtterAI dashboard' },
  ];
};

export default function DashboardPage() {
  const { userProfile } = useUser();
  const projects = useStore(projectsStore);
  
  const recentProjects = projects
    .filter(p => p.status === 'active')
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    .slice(0, 4);
  
  const featuredTemplates = getFeaturedTemplates().slice(0, 3);

  return (
    <PlatformLayout>
      <div className="min-h-screen bg-bg-1 dark:bg-black">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#e86b47]/10 dark:bg-[#e86b47]/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#e86b47]/8 dark:bg-[#e86b47]/12 rounded-full blur-3xl translate-x-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Welcome Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h1 className="font-heading text-5xl lg:text-6xl text-text-primary dark:text-white tracking-tighter mb-4">
              Welcome back, {userProfile?.name}!
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e86b47]/10 dark:bg-[#e86b47]/20 border border-[#e86b47]/20 rounded-full">
              <span className="text-sm font-medium text-[#e86b47]">
                {userProfile?.tier.charAt(0).toUpperCase()}{userProfile?.tier.slice(1)} Plan
              </span>
              <span className="text-xs text-[#e86b47]/70">
                {userProfile?.credits} credits remaining
              </span>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          >
            <Link
              to="/"
              className="group relative overflow-hidden bg-white dark:bg-bg-2 border border-border-primary dark:border-border-primary rounded-xl p-8 hover:border-[#e86b47]/50 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#e86b47] rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-300">
                    ✨
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary dark:text-white mb-1 group-hover:text-[#e86b47] transition-colors">
                      Start from Scratch
                    </h3>
                    <p className="text-sm text-text-secondary dark:text-text-secondary">
                      Create a new project with AI assistance
                    </p>
                  </div>
                </div>
              </div>
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#e86b47]/10 dark:bg-[#e86b47]/20 rounded-full blur-2xl"></div>
            </Link>

            <Link
              to="/templates"
              className="group relative overflow-hidden bg-white dark:bg-bg-2 border border-border-primary dark:border-border-primary rounded-xl p-8 hover:border-[#e86b47]/50 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#e86b47] rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-300">
                    📦
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary dark:text-white mb-1 group-hover:text-[#e86b47] transition-colors">
                      Browse Templates
                    </h3>
                    <p className="text-sm text-text-secondary dark:text-text-secondary">
                      Start with a professional template
                    </p>
                  </div>
                </div>
              </div>
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#e86b47]/10 dark:bg-[#e86b47]/20 rounded-full blur-2xl"></div>
            </Link>
          </motion.div>

          {/* Recent Projects */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-3xl lg:text-4xl text-text-primary dark:text-white tracking-tight">
                Recent Projects
              </h2>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#e86b47] hover:text-[#e86b47]/80 transition-colors border border-white/20 dark:border-white/10 rounded-lg hover:border-[#e86b47]/30"
              >
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <ProjectGrid
              projects={recentProjects}
              onDeleteProject={deleteProject}
              emptyMessage="No projects yet. Create your first project to get started!"
            />
          </motion.div>

          {/* Featured Templates */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-3xl lg:text-4xl text-text-primary dark:text-white tracking-tight">
                Featured Templates
              </h2>
              <Link
                to="/templates"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#e86b47] hover:text-[#e86b47]/80 transition-colors border border-white/20 dark:border-white/10 rounded-lg hover:border-[#e86b47]/30"
              >
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <TemplateGrid templates={featuredTemplates} />
          </motion.div>
        </div>
      </div>
    </PlatformLayout>
  );
}



