import {
  // Router,
  createCors,
  RequestLike,
  IRequest,
  error,
} from 'itty-router';
import { OpenAPIRouter } from '@cloudflare/itty-router-openapi';

import { jsonData, withCfHeaders, withCfSummary } from '../middleware';

import data from './data.json';

const { preflight, corsify } = createCors();

// export { preflight, corsify };

type CF = [env: Env, context: ExecutionContext];

const router = OpenAPIRouter<IRequest, CF>({
  schema: {
    info: {
      title: 'Ai Maps API',
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
  .all('/*', withCfHeaders())
  // .all('/api/*', () => {})
  .get('/json-data', (req: IRequest, res: Response, env: Env, ctx: ExecutionContext) =>
    jsonData(req, res, env, data),
  )
  .get('/hello', withCfSummary(), (req: IRequest, res: Response, env: Env, ctx: ExecutionContext) =>
    jsonData(req, res, env, { hello: 'world' }),
  )
  // .all("*", error_handler)
  .all('*', () => error(404, 'Oops... Are you sure about that? FAaFO'));

export default router;
