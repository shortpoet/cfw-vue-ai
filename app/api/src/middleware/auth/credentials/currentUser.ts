import { badResponse, okResponse } from '../../response';
import { withCfSummary } from '../../request';
import { getCookieAuthToken } from 'app/utils';
export interface CredsUser {
  key: string;
  username: string;
  passwordHash: string;
  createdAt: number;
}

export const sanitizeUser = (user: CredsUser): string => {
  const sanitizedUser = Object.assign({}, user);
  Reflect.deleteProperty(sanitizedUser, 'passwordHash');
  return JSON.stringify(sanitizedUser, null, 2);
};

export const getUserFromAuthToken = async (
  env: Env,
  authToken: string
): Promise<CredsUser | null> => {
  // ensure KV is correct and ready
  const key = await env.CFW_VUE_AI_KV_UI.get(authToken);
  if (!key) return null;

  const user = await env.CFW_VUE_AI_KV_UI.get(key);
  return user;
};

export default [
  withCfSummary,
  async (req: Request, response: Response, env: Env, context: ExecutionContext) => {
    const authToken = await getCookieAuthToken(req);
    if (!authToken) return badResponse(new Error(`Missing user "token" in cookie.`), response);
    const user = await getUserFromAuthToken(env, authToken);
    if (!user) return badResponse(new Error(`Invalid token.`), response);

    return okResponse(sanitizeUser(user), response);
  },
];
