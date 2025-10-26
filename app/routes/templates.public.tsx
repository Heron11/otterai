import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface PublicProject {
  id: string;
  name: string;
  description: string | null;
  visibility: 'public' | 'private' | 'unlisted';
  created_at: string;
  updated_at: string;
  view_count: number;
  clone_count: number;
}

interface LoaderData {
  publicProjects: PublicProject[];
  featuredProjects: PublicProject[];
  total: number;
}

export async function loader({ context }: LoaderFunctionArgs) {
  try {
    const response = await fetch(`${context.cloudflare.env.APP_URL || 'http://localhost:8787'}/api/public-templates`);
    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Error loading public templates:', error);
    return json({
      publicProjects: [],
      featuredProjects: [],
      total: 0
    });
  }
}

export default function PublicTemplatesPage() {
  const { publicProjects, featuredProjects, total } = useLoaderData<LoaderData>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  // Combine all projects (public + featured) and remove duplicates
  const allProjects = [...publicProjects, ...featuredProjects];
  const uniqueProjects = allProjects.filter((project, index, self) => 
    index === self.findIndex(p => p.id === project.id)
  );

  const filteredProjects = uniqueProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    } else {
      return (b.clone_count || 0) - (a.clone_count || 0);
    }
  });

  return (
    <PlatformLayout>
      <div className="bg-bg-1 dark:bg-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-bolt-elements-textPrimary mb-4">
              Templates
            </h1>
            <p className="text-lg text-bolt-elements-textSecondary max-w-2xl mx-auto">
              Discover and clone {uniqueProjects.length} amazing projects created by the OtterAI community. 
              Find inspiration for your next project or share your own creations.
            </p>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-bg-4 border border-border-primary rounded-lg text-text-primary dark:text-white focus:ring-2 focus:ring-[#e86b47] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  sortBy === 'recent'
                    ? 'bg-[#e86b47] text-white'
                    : 'bg-white dark:bg-bg-4 border border-border-primary text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Most Recent
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  sortBy === 'popular'
                    ? 'bg-[#e86b47] text-white'
                    : 'bg-white dark:bg-bg-4 border border-border-primary text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Most Popular
              </button>
            </div>
          </div>

          {/* Featured Templates */}
          {featuredProjects.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-bolt-elements-textPrimary mb-6">
                Featured Templates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProjects.map((project) => (
                  <PublicTemplateCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}

          {/* All Templates */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-bolt-elements-textPrimary">
                All Templates
              </h2>
              <span className="text-sm text-bolt-elements-textSecondary">
                {sortedProjects.length} of {total} templates
              </span>
            </div>

            {sortedProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-2">
                  No templates found
                </h3>
                <p className="text-bolt-elements-textSecondary">
                  {searchQuery ? 'Try adjusting your search terms' : 'No public templates available yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProjects.map((project) => (
                  <PublicTemplateCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}

interface PublicTemplateCardProps {
  project: PublicProject;
}

function PublicTemplateCard({ project }: PublicTemplateCardProps) {
  const [isCloning, setIsCloning] = useState(false);
  const [viewCount, setViewCount] = useState(project.view_count || 0);

  // Track view when component mounts (template is displayed)
  useEffect(() => {
    const trackView = async () => {
      try {
        const response = await fetch('/api/projects/increment-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: project.id
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setViewCount(prev => prev + 1);
          }
        }
      } catch (error) {
        console.error('Failed to track view:', error);
        // Don't show error to user, just fail silently
      }
    };

    trackView();
  }, [project.id]);

  const handleClone = async () => {
    setIsCloning(true);
    
    try {
      const response = await fetch('/api/projects/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceProjectId: project.id,
          newProjectName: `${project.name} (Clone)`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to clone project');
      }

      const result = await response.json();
      
      // Redirect to the new project
      window.location.href = `/project/${result.project.id}`;
    } catch (error) {
      console.error('Error cloning project:', error);
      alert('Failed to clone project. Please try again.');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="group relative bg-white dark:bg-bg-2 border border-border-primary dark:border-border-primary rounded-xl p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Clone button */}
      <button
        onClick={handleClone}
        disabled={isCloning}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-[#e86b47] transition-all duration-200 rounded-lg bg-transparent hover:bg-[#e86b47]/10"
        title="Clone this template"
      >
        {isCloning ? (
          <div className="w-4 h-4 border-2 border-[#e86b47] border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      {/* Project icon */}
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#e86b47] to-[#d45a36] rounded-xl flex items-center justify-center">
          <img 
            src="/lightmodeavatar.svg" 
            alt="OtterAI" 
            className="w-8 h-8"
          />
        </div>
      </div>

      {/* Project info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-2 line-clamp-1">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-sm text-bolt-elements-textSecondary line-clamp-2">
            {project.description}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-bolt-elements-textTertiary mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{project.clone_count || 0}</span>
          </div>
        </div>
        <span className="text-xs">
          {format(new Date(project.updated_at), 'MMM d')}
        </span>
      </div>

      {/* Clone button (bottom) */}
      <button
        onClick={handleClone}
        disabled={isCloning}
        className="w-full py-2 px-4 bg-[#e86b47] text-white rounded-lg font-medium hover:bg-[#d45a36] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCloning ? 'Cloning...' : 'Clone Template'}
      </button>
    </div>
  );
}
