import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { getTemplateById } from '~/lib/mock/templates';
import { useSubscription } from '~/lib/hooks/platform/useSubscription';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.template) {
    return [{ title: 'Template Not Found - OtterAI' }];
  }
  
  return [
    { title: `${data.template.name} - OtterAI` },
    { name: 'description', content: data.template.description },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const template = getTemplateById(params.id!);
  
  if (!template) {
    throw new Response('Template not found', { status: 404 });
  }
  
  return { template };
}

export default function TemplateDetailPage() {
  const { template } = useLoaderData<typeof loader>();
  const { canAccessTemplate } = useSubscription();
  const hasAccess = canAccessTemplate(template.requiredTier);

  return (
    <PlatformLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link
          to="/templates"
          className="inline-flex items-center text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary mb-6 transition-colors"
        >
          ← Back to templates
        </Link>

        {/* Template header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-bolt-elements-textPrimary mb-2">
                {template.name}
              </h1>
              <p className="text-lg text-bolt-elements-textSecondary">
                {template.description}
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className="px-3 py-1 bg-bolt-elements-background-depth-2 rounded-full text-sm text-bolt-elements-textSecondary">
                {template.usageCount.toLocaleString()} uses
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                template.requiredTier === 'pro' ? 'bg-purple-500/20 text-purple-400' :
                template.requiredTier === 'plus' ? 'bg-blue-500/20 text-blue-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {template.requiredTier.charAt(0).toUpperCase() + template.requiredTier.slice(1)}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-bolt-elements-background-depth-2 rounded-md text-sm text-bolt-elements-textSecondary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Template preview/thumbnail */}
        <div className="aspect-video bg-bolt-elements-background-depth-3 rounded-lg mb-8 flex items-center justify-center">
          {template.thumbnailUrl ? (
            <img
              src={template.thumbnailUrl}
              alt={template.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-9xl opacity-20">
              {template.framework === 'react' ? '⚛️' : 
               template.framework === 'next' ? '▲' :
               template.framework === 'vue' ? '🖖' :
               template.framework === 'svelte' ? '🔥' :
               '💻'}
            </div>
          )}
        </div>

        {/* Description */}
        {template.longDescription && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-bolt-elements-textPrimary mb-4">
              About this template
            </h2>
            <p className="text-bolt-elements-textSecondary leading-relaxed">
              {template.longDescription}
            </p>
          </div>
        )}

        {/* Details */}
        <div className="bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-bolt-elements-textPrimary mb-4">
            Details
          </h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-bolt-elements-textSecondary mb-1">Category</dt>
              <dd className="text-bolt-elements-textPrimary capitalize">{template.category}</dd>
            </div>
            <div>
              <dt className="text-sm text-bolt-elements-textSecondary mb-1">Framework</dt>
              <dd className="text-bolt-elements-textPrimary capitalize">{template.framework}</dd>
            </div>
            <div>
              <dt className="text-sm text-bolt-elements-textSecondary mb-1">Required Tier</dt>
              <dd className="text-bolt-elements-textPrimary capitalize">{template.requiredTier}</dd>
            </div>
            <div>
              <dt className="text-sm text-bolt-elements-textSecondary mb-1">Last Updated</dt>
              <dd className="text-bolt-elements-textPrimary">{new Date(template.updatedAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        {/* CTA */}
        <div className="flex gap-4">
          {hasAccess ? (
            <Link
              to={`/?template=${template.id}`}
              className="flex-1 px-6 py-3 text-center bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text rounded-md font-medium hover:bg-bolt-elements-button-primary-backgroundHover transition-colors"
            >
              Use This Template
            </Link>
          ) : (
            <Link
              to="/pricing"
              className="flex-1 px-6 py-3 text-center bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text rounded-md font-medium hover:bg-bolt-elements-button-primary-backgroundHover transition-colors"
            >
              Upgrade to Access
            </Link>
          )}
          
          <a
            href={template.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-bolt-elements-borderColor rounded-md font-medium text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </PlatformLayout>
  );
}

