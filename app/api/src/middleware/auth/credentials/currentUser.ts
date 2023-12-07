import { getCookieAuthToken, getUserFromAuthToken, sanitizeUser } from './user';
import { badResponse, okResponse, withCfSummary } from '../../response';
import { Env } from '@/types';

export default [
  withCfSummary,
  async (req: Request, response: Response, env: Env, context: ExecutionContext) => {
    const authToken = await getCookieAuthToken(req);
    if (!authToken)
      return badResponse(new Error(`Missing user "token" in cookie.`), response);
    const user = await getUserFromAuthToken(env, authToken);
    if (!user) return badResponse(new Error(`Invalid token.`), response);

    return okResponse(sanitizeUser(user), response);
  }
];
