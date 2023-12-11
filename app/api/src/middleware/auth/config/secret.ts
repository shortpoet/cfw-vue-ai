import { logger } from '@cfw-vue-ai/utils';
const FILE_LOG_LEVEL = 'debug';

export const deriveSecretsFromEnv = async (env: Env) => {
  const { NEXTAUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = env;
  const log = logger(FILE_LOG_LEVEL, env);

  if (!NEXTAUTH_SECRET || !GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    log(`[api] auth.config -> missing secret or env vars in env -> trying to get from KV`);
    const secret = await env.CFW_VUE_AI_UI.get('NEXTAUTH_SECRET');
    const GITHUB_CLIENT_ID = await env.CFW_VUE_AI_UI.get('GITHUB_CLIENT_ID');
    const GITHUB_CLIENT_SECRET = await env.CFW_VUE_AI_UI.get('GITHUB_CLIENT_SECRET');
    if (!secret || !GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      const which = [!secret, !GITHUB_CLIENT_ID, !GITHUB_CLIENT_SECRET]
        .map((b) => b.toString())
        .filter(Boolean)
        .join(', ');
      throw new Error(
        `[api] auth.config -> missing secret or env vars -> \n\t\t[NEXTAUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET] -> ${which}]`
      );
    } else {
      log(
        `[api] auth.config -> got secret and env vars from KV -> ${secret}, ${GITHUB_CLIENT_ID}, ${GITHUB_CLIENT_SECRET}`
      );
    }
  }
  return { secret: NEXTAUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET };
};
