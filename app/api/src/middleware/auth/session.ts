import { UserRole } from '@cfw-vue-ai/types';
import { getDatabaseFromEnv, q } from '@cfw-vue-ai/db/src';
import { unauthorizedResponse } from '../response';
import { getSessionItty } from './middleware-itty';
import { getCookieAuthToken, logger, logObjs } from '@cfw-vue-ai/utils';
const FILE_LOG_LEVEL = 'debug';

export const withSession =
  ({ required = true } = {}) =>
  async (req: Request, res: Response, env: Env, ctx: ExecutionContext) => {
    const log = logger(FILE_LOG_LEVEL, env);
    // log(`[api] [middleware] [auth] [withSession] -> ${req.method} -> ${req.url}`);
    if (required) log(`[api] [middleware] [auth] [withSession]  -> required -> ${required} `);
    const session = await getSessionItty(req, res, env);
    // log(`[api] [middleware] [auth] [withSession] -> session ->`);
    // logObjs([session]);
    // if (!session) {
    //   log(`[api] [middleware] [auth] [withSession] -> !session ->`);
    //   return unauthorizedResponse('Unauthorized - no session', res);
    // }
    log(
      `[api] [middleware] [auth] [withSession] -> setting res.session to session from itty res ->`
    );
    res.session = session;
    const db = getDatabaseFromEnv(env);
    if (!db || !session?.sessionToken) return;
    const dbSession = await q.getSession(session.sessionToken, db);
    if (dbSession) {
      log(`[api] [middleware] [auth] [withSession] -> setting req.session to dbSession ->`);
      req.session = dbSession;
    }
    // return res;
  };

export const withAuth =
  ({ roles = [UserRole.Admin] }: { roles?: UserRole[] } = {}) =>
  async (req: Request, res: Response, env: Env, ctx: ExecutionContext) => {
    roles = [...roles, UserRole.Admin];
    const log = logger(FILE_LOG_LEVEL, env);
    log(`[api] [middleware] [auth] [withAuth] -> ${req.method} -> ${req.url}`);
    // log(`[api] [middleware] [auth] [withAuth] -> REQ.session ->`);
    // console.log(req.session);
    // log(`[api] [middleware] [auth] [withAuth] -> RES.session ->`);
    // console.log(res.session);
    let sanitizedToken: string | null = null;
    const session = res.session;
    // const session = await getSessionItty(req, res, env);

    const user = session?.user;
    const userRoles = user?.roles;
    // log(`[api] [middleware] [auth] [withAuth]-> session -> ${session}`);
    // log(`[api] [middleware] [auth] [withAuth]-> user -> ${user}`);
    // log(`[api] [middleware] [auth] [withAuth]-> role -> ${role}`);
    const authBypass = false;
    if (!session || !user) {
      // if ((!session || !user) && !authBypass) {
      // log(`[api] [middleware] [auth] [withAuth] -> !session || !user ->`);
      return unauthorizedResponse(
        JSON.stringify(
          { msg: `[api] [middleware] [auth] [withAuth] Unauthorized - no session` },
          null,
          2
        ),
        res
      );
    }
    if (
      roles.length &&
      userRoles &&
      !userRoles.some((role) => roles.includes(role))
      //  && !authBypass
    ) {
      // log(
      //   `[api] [middleware] [auth] [withAuth] -> roles.length && !roles.includes(role) ->`
      // );
      // logObjs([roles, role]);
      return unauthorizedResponse(
        JSON.stringify(
          { msg: `[api] [middleware] [auth] [withAuth] Unauthorized - invalid role` },
          null,
          2
        ),
        res,
        403
      );
    }
  };
