import { useStore } from '@nanostores/react';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteLoaderData } from '@remix-run/react';
import { rootAuthLoader } from '@clerk/remix/ssr.server';
import { ClerkApp } from '@clerk/remix';
import tailwindReset from '@unocss/reset/tailwind-compat.css?url';
import { themeStore } from './lib/stores/theme';
import { stripIndents } from './utils/stripIndent';
import { createHead } from 'remix-island';
import { useEffect } from 'react';
import { BetaBanner } from './components/ui/BetaBanner';

declare global {
  interface Window {
    ENV?: {
      CLERK_PUBLISHABLE_KEY?: string;
    };
  }
}

import reactToastifyStyles from 'react-toastify/dist/ReactToastify.css?url';
import globalStyles from './styles/index.scss?url';
import xtermStyles from '@xterm/xterm/css/xterm.css?url';

import 'virtual:uno.css';

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.ico',
    type: 'image/x-icon',
  },
  { rel: 'stylesheet', href: reactToastifyStyles },
  { rel: 'stylesheet', href: tailwindReset },
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'stylesheet', href: xtermStyles },
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
];

const inlineThemeCode = stripIndents`
  setTutorialKitTheme();

  function setTutorialKitTheme() {
    let theme = localStorage.getItem('bolt_theme');

    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;

export const loader = (args: LoaderFunctionArgs) => {
  return rootAuthLoader(
    args,
    ({ request }) => {
      const { sessionId, userId, sessionClaims } = request.auth;
      return { 
        sessionId, 
        userId, 
        sessionClaims,
        ENV: {
          CLERK_PUBLISHABLE_KEY: args.context.CLERK_PUBLISHABLE_KEY,
        },
      };
    },
    {
      publishableKey: args.context.CLERK_PUBLISHABLE_KEY,
      secretKey: args.context.CLERK_SECRET_KEY,
    }
  );
};

export const Head = createHead(() => (
  <>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <Meta />
    <Links />
    <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />
  </>
));

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useStore(themeStore);
  // Use useRouteLoaderData instead of useLoaderData - it returns undefined in error boundaries
  const data = useRouteLoaderData<typeof loader>('root');

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      {children}
      <ScrollRestoration />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(data?.ENV || {})}`,
        }}
      />
      <Scripts />
    </>
  );
}

function App() {
  return (
    <>
      <BetaBanner />
      <Outlet />
    </>
  );
}

export function ErrorBoundary() {
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />
        <style dangerouslySetInnerHTML={{
          __html: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background: #f9fafb;
              color: #111827;
            }
            .error-container {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20px;
            }
            .error-content {
              text-align: center;
              max-width: 500px;
            }
            .error-title {
              font-size: 2rem;
              font-weight: 600;
              margin-bottom: 1rem;
              color: #dc2626;
            }
            .error-message {
              font-size: 1.125rem;
              color: #6b7280;
              margin-bottom: 2rem;
            }
            .error-button {
              display: inline-block;
              padding: 0.75rem 1.5rem;
              background: #dc2626;
              color: white;
              text-decoration: none;
              border-radius: 0.5rem;
              font-weight: 500;
              transition: background-color 0.2s;
            }
            .error-button:hover {
              background: #b91c1c;
            }
          `
        }} />
      </head>
      <body>
        <div className="error-container">
          <div className="error-content">
            <h1 className="error-title">Something went wrong</h1>
            <p className="error-message">We're sorry, but something unexpected happened. Please try refreshing the page.</p>
            <a href="/" className="error-button">Go to Home</a>
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = {};`,
          }}
        />
      </body>
    </html>
  );
}

// Wrap the app with Clerk for authentication
export default ClerkApp(App);
