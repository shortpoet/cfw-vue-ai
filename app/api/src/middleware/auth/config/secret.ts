import { Env } from 'types/index';
import { logger } from '@/ai-maps-util';
const FILE_LOG_LEVEL = 'debug';

export const deriveSecretsFromEnv = async (env: Env) => {
  const { NEXTAUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = env;
  const log = logger(FILE_LOG_LEVEL, env);

  if (!NEXTAUTH_SECRET || !GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    log(
      `[worker] auth.config -> missing secret or env vars in env -> trying to get from KV`
    );
    const secret = await env.AI_MAPS_UI.get('NEXTAUTH_SECRET');
    const GITHUB_CLIENT_ID = await env.AI_MAPS_UI.get('GITHUB_CLIENT_ID');
    const GITHUB_CLIENT_SECRET = await env.AI_MAPS_UI.get('GITHUB_CLIENT_SECRET');
    if (!secret || !GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      const which = [!secret, !GITHUB_CLIENT_ID, !GITHUB_CLIENT_SECRET]
        .map((b) => b.toString())
        .filter(Boolean)
        .join(', ');
      throw new Error(
        `[worker] auth.config -> missing secret or env vars -> \n\t\t[NEXTAUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET] -> ${which}]`
      );
    } else {
      log(
        `[worker] auth.config -> got secret and env vars from KV -> ${secret}, ${GITHUB_CLIENT_ID}, ${GITHUB_CLIENT_SECRET}`
      );
    }
  }
  return { secret: NEXTAUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET };
};
