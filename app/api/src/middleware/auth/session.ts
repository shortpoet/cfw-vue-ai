import { Env, UserRole } from '@/types/index';
const FILE_LOG_LEVEL = 'debug';
import { getCookieAuthToken, logger, logObjs } from '@/ai-maps-util/index';
import { unauthorizedResponse } from '../response';
import { getSessionItty } from './middleware-itty';
import { getDatabaseFromEnv, q } from '@/db/src';

export const withSession =
  ({ required = true } = {}) =>
  async (req: Request, res: Response, env: Env, ctx: ExecutionContext) => {
    const log = logger(FILE_LOG_LEVEL, env);
    // log(`[worker] [middleware] [auth] [withSession] -> ${req.method} -> ${req.url}`);
    if (required)
      log(`[worker] [middleware] [auth] [withSession]  -> required -> ${required} `);
    const session = await getSessionItty(req, res, env);
    // log(`[worker] [middleware] [auth] [withSession] -> session ->`);
    // logObjs([session]);
    // if (!session) {
    //   log(`[worker] [middleware] [auth] [withSession] -> !session ->`);
    //   return unauthorizedResponse('Unauthorized - no session', res);
    // }
    log(
      `[worker] [middleware] [auth] [withSession] -> setting res.session to session from itty res ->`
    );
    res.session = session;
    const db = getDatabaseFromEnv(env);
    if (!db || !session?.sessionToken) return;
    const dbSession = await q.getSession(session.sessionToken, db);
    if (dbSession) {
      log(
        `[worker] [middleware] [auth] [withSession] -> setting req.session to dbSession ->`
      );
      req.session = dbSession;
    }
    // return res;
  };

export const withAuth =
  ({ roles = [UserRole.Admin] }: { roles?: UserRole[] } = {}) =>
  async (req: Request, res: Response, env: Env, ctx: ExecutionContext) => {
    roles = [...roles, UserRole.Admin];
    const log = logger(FILE_LOG_LEVEL, env);
    log(`[worker] [middleware] [auth] [withAuth] -> ${req.method} -> ${req.url}`);
    // log(`[worker] [middleware] [auth] [withAuth] -> REQ.session ->`);
    // console.log(req.session);
    // log(`[worker] [middleware] [auth] [withAuth] -> RES.session ->`);
    // console.log(res.session);
    let sanitizedToken: string | null = null;
    const session = res.session;
    // const session = await getSessionItty(req, res, env);

    const user = session?.user;
    const userRoles = user?.roles;
    // log(`[worker] [middleware] [auth] [withAuth]-> session -> ${session}`);
    // log(`[worker] [middleware] [auth] [withAuth]-> user -> ${user}`);
    // log(`[worker] [middleware] [auth] [withAuth]-> role -> ${role}`);
    if (!session || !user) {
      // log(`[worker] [middleware] [auth] [withAuth] -> !session || !user ->`);
      return unauthorizedResponse(
        JSON.stringify(
          { msg: `[worker] [middleware] [auth] [withAuth] Unauthorized - no session` },
          null,
          2
        ),
        res
      );
    }
    if (roles.length && userRoles && !userRoles.some((role) => roles.includes(role))) {
      // log(
      //   `[worker] [middleware] [auth] [withAuth] -> roles.length && !roles.includes(role) ->`
      // );
      // logObjs([roles, role]);
      return unauthorizedResponse(
        JSON.stringify(
          { msg: `[worker] [middleware] [auth] [withAuth] Unauthorized - invalid role` },
          null,
          2
        ),
        res,
        403
      );
    }
  };
