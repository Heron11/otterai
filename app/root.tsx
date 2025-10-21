import { useStore } from '@nanostores/react';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
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
  // Extensive logging for debugging
  console.log('🔍 ROOT LOADER DEBUG:');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Request URL:', args.request.url);
  console.log('Context keys:', Object.keys(args.context));
  console.log('Cloudflare env keys:', Object.keys(args.context.cloudflare?.env || {}));
  
  // Check if environment variables exist
  const publishableKey = args.context.cloudflare?.env?.CLERK_PUBLISHABLE_KEY;
  const secretKey = args.context.cloudflare?.env?.CLERK_SECRET_KEY;
  
  console.log('CLERK_PUBLISHABLE_KEY exists:', !!publishableKey);
  console.log('CLERK_PUBLISHABLE_KEY value:', publishableKey ? `${publishableKey.substring(0, 10)}...` : 'undefined');
  console.log('CLERK_SECRET_KEY exists:', !!secretKey);
  console.log('CLERK_SECRET_KEY value:', secretKey ? `${secretKey.substring(0, 10)}...` : 'undefined');
  
  if (!publishableKey) {
    console.error('❌ CRITICAL: CLERK_PUBLISHABLE_KEY is missing!');
  }
  if (!secretKey) {
    console.error('❌ CRITICAL: CLERK_SECRET_KEY is missing!');
  }

  return rootAuthLoader(
    args,
    ({ request }) => {
      const { sessionId, userId, sessionClaims } = request.auth;
      console.log('🔍 AUTH DATA:', { sessionId, userId, sessionClaims });
      
      return { 
        sessionId, 
        userId, 
        sessionClaims,
        ENV: {
          CLERK_PUBLISHABLE_KEY: publishableKey,
        },
      };
    },
    {
      publishableKey: publishableKey,
      secretKey: secretKey,
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
  const data = useLoaderData<typeof loader>();

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme]);

  // Client-side logging
  useEffect(() => {
    console.log('🔍 CLIENT-SIDE DEBUG:');
    console.log('Window ENV:', window.ENV);
    console.log('Loader data:', data);
    console.log('CLERK_PUBLISHABLE_KEY in window.ENV:', window.ENV?.CLERK_PUBLISHABLE_KEY);
    
    if (!window.ENV?.CLERK_PUBLISHABLE_KEY) {
      console.error('❌ CRITICAL: CLERK_PUBLISHABLE_KEY not found in window.ENV!');
    }
  }, [data]);

  return (
    <>
      {children}
      <ScrollRestoration />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(data?.ENV || {})}; console.log('🔍 SCRIPT INJECTION: window.ENV =', window.ENV);`,
        }}
      />
      <Scripts />
    </>
  );
}

export function ErrorBoundary() {
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>Please try refreshing the page.</p>
        </div>
        <Scripts />
      </body>
    </html>
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

// Wrap the app with Clerk for authentication
export default ClerkApp(App);
