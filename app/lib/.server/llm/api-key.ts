import { env } from 'node:process';

export function getAPIKey(cloudflareEnv: any) {
  /**
   * The `cloudflareEnv` is only used when deployed or when previewing locally.
   * In development the environment variables are available through `env`.
   */
  return env.XAI_API_KEY || cloudflareEnv.XAI_API_KEY;
}
