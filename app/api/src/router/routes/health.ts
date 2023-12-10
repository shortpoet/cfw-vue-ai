import { IRequest } from 'itty-router';
import { OpenAPIRouter } from '@cloudflare/itty-router-openapi';

import { UserRole } from '@cfw-vue-ai/types';
import { logObjs, logger } from '@cfw-vue-ai/utils';
import { corsify } from '..';
import { jsonData, unauthorizedResponse, withAuth } from '../../middleware';
import { debugRes, healthCheck, healthCheckJson } from '../../controllers';

const FILE_LOG_LEVEL = 'debug';

type CF = [env: Env, context: ExecutionContext];
const router = OpenAPIRouter<IRequest, CF>({ base: '/api/health' });

router.all('/', () => new Response(JSON.stringify({ ping: 'pong' })));

router.get(
  '/debug',
  withAuth({ roles: [UserRole.Admin] }),
  async (req: Request, res: Response, env: Env, ctx: ExecutionContext) => {
    const log = logger(FILE_LOG_LEVEL, env);
    const debugResponse = await debugRes(req, res, env, ctx, false);
    log(`[api] [routes] [health] [debug] GET -> debugResponse ->`);
    // logObjs([debugResponse]);
    return jsonData(req, res, env, debugResponse);
  }
);
router.post(
  '/debug',
  withAuth({ roles: [UserRole.Admin] }),
  async (req: Request, res: Response, env: Env, ctx: ExecutionContext) => {
    const log = logger(FILE_LOG_LEVEL, env);
    const debugResponse = await debugRes(req, res, env, ctx, false);
    log(`[api] [routes] [health] [debug] POST -> debugResponse ->`);
    // logObjs([debugResponse]);
    return jsonData(req, res, env, debugResponse);
  }
);
router.get('/check', (req: Request, res: Response, env: Env, ctx: ExecutionContext) =>
  healthCheckJson(req, env)
);
router.post('/check', withAuth(), (req: Request, res: Response, env: Env, ctx: ExecutionContext) =>
  healthCheckJson(req, env)
);
router.get('/check2', withAuth(), (req: IRequest, res: Response, env: Env, ctx: ExecutionContext) =>
  healthCheckJson(req, env)
);
router.get(
  '/check-root',
  withAuth(),
  async (req: IRequest, res: Response, env: Env, ctx: ExecutionContext) =>
    Promise.resolve(corsify(await healthCheck(req, env)))
);

// router.all("*", () => error(404, "Are you sure about that?"));

export default router;
