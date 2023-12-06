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
import { scrapeUrl } from '../middleware/scraping';
// import handleProxy from '../middleware/proxy';
// import handleRedirect from '../middleware/redirect';

// case path === '/redirect':
//   return handleRedirect.fetch(request, env, ctx);
// case path === '/proxy':
//   return handleProxy.fetch(request, env, ctx);

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
    jsonData(req, res, env, data)
  )
  .get('/hello', withCfSummary(), (req: IRequest, res: Response, env: Env, ctx: ExecutionContext) =>
    jsonData(req, res, env, { hello: 'world' })
  )
  .get('/scrape', async (req: IRequest, res: Response, env: Env, ctx: ExecutionContext) => {
    // const { url } = req.query;
    const url = 'https://www.scrapethissite.com/pages/simple/';
    const { markdown, favicon, title } = await scrapeUrl(url);
    return { markdown, favicon, title };
  })
  // .all("*", error_handler)
  .all('*', () => error(404, 'Oops... Are you sure about that? FAaFO'));

export default router;
