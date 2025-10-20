import { type PlatformProxy } from 'wrangler';

type Cloudflare = Omit<PlatformProxy<Env>, 'dispose'>;

declare module '@remix-run/cloudflare' {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    CLERK_PUBLISHABLE_KEY?: string;
    CLERK_SECRET_KEY?: string;
  }
}

type GetLoadContext = (args: { context: { cloudflare: Cloudflare } }) => {
  cloudflare: Cloudflare;
  CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
};

export const getLoadContext: GetLoadContext = ({ context }) => {
  return {
    cloudflare: context.cloudflare,
    CLERK_PUBLISHABLE_KEY: context.cloudflare.env.CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: context.cloudflare.env.CLERK_SECRET_KEY,
  };
};
