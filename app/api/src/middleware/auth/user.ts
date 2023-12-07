import { Env } from '@/types/index';
const FILE_LOG_LEVEL = 'debug';
import { getCookieAuthToken, logger, logObjs } from '@/ai-maps-util/index';
import { unauthorizedResponse } from '../response';

export interface User {
  key: string;
  username: string;
  passwordHash: string;
  createdAt: number;
}
export const getUserFromAuthToken = async (
  env: Env,
  authToken: string
): Promise<User | null> => {
  const key = await env.AI_MAPS_TOKENS.get(authToken);
  if (!key) return null;

  const user = await env.AI_MAPS_USERS.get(key);
  return user;
};

export const sanitizeUser = (user: User): string => {
  const sanitizedUser = Object.assign({}, user);
  Reflect.deleteProperty(sanitizedUser, 'passwordHash');
  return JSON.stringify(sanitizedUser, null, 2);
};

export const withUser =
  ({ required = true } = {}) =>
  async (req: Request, res: Response, env: Env, ctx: ExecutionContext) => {
    const log = logger(FILE_LOG_LEVEL, env);
    log(`[worker] auth.middlware.withUser -> ${req.method} -> ${req.url}`);
    if (required)
      log(
        `[worker] auth.middlware.withUser -> required -> ${required} -> env.kv -> ${env.kv}`
      );
    const createdAt = Date.now();
    const token = 'token';
    req.auth = {
      sanitizedUser: '',
      user: {
        username: 'carlos',
        createdAt
      },
      token
    };
  };

export const withAuthUser =
  ({ required = true } = {}) =>
  async (req: Request, res: Response, env: Env, ctx: ExecutionContext) => {
    const authToken = await getCookieAuthToken(req);
    if (authToken) {
      const user = await getUserFromAuthToken(env, authToken);
      if (user) {
        const sanitizedUser = sanitizeUser(user);
        req.auth = {
          sanitizedUser,
          user,
          token: authToken
        };
      }
    }

    if (required && !req.auth) return unauthorizedResponse();
  };
