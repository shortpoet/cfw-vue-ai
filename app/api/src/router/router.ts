import { createCors, RequestLike, IRequest, error } from 'itty-router';
import { ExecutionContext } from '@cloudflare/workers-types';
import { ServerResponse } from 'http';
import { OpenAPIRouter } from '@cloudflare/itty-router-openapi';

import sampleData from '@cfw-vue-ai/db/src/data.json';
import {
  authMiddlewareItty as authMiddleware,
  withSession,
  withCfHeaders,
  withCfSummary,
  jsonData,
  withUser,
} from '../middleware';

import { auth_dbv1_router } from 'api/router';
import { health_router } from 'api/router';

const FILE_LOG_LEVEL = 'error';

const { preflight, corsify } = createCors();

export { corsify };

type CF = [env: Env, context: ExecutionContext];

const router = OpenAPIRouter<IRequest, CF>({
  schema: {
    info: {
      title: 'CFW Vue AI API',
      version: '1.0',
    },
  },
  base: '/api',
  docs_url: '/docs',
  openapi_url: '/openapi.json',
});

const protectedRoutes = {
  '/api/health/debug': { route: '/api/health/debug', isAdmin: true },
};

router
  .options('*', preflight)
  // .all('*', withCfHeaders())
  .all('*', authMiddleware)
  // .all('*', withSession())
  // .all('/db-v1/*', auth_dbv1_router)
  .all('/health/*', health_router)
  .get('/json-data', (req: IRequest, res: Response, env: Env, ctx: ExecutionContext) => {
    console.log(`[api] /json-data -> ${req.method} -> ${req.url} -> req`);
    console.log(sampleData);
    return jsonData(req, res, env, sampleData);
  })
  .get(
    '/hello',
    withCfSummary(),
    withUser(),
    (req: IRequest, res: Response, env: Env, ctx: ExecutionContext) =>
      jsonData(req, res, env, { hello: 'world' })
  )
  // .all("*", error_handler)
  .all('*', () => error(404, 'Oops... Are you sure about that? FAaFO'));

const Api = {
  handle: (req: Request, resp: Response | ServerResponse, env: Env, ctx: ExecutionContext) => {
    const out = router.handle(req, resp, env, ctx);
    return out;
  },
};

export default Api;
