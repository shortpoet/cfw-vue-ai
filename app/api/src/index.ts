/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { ExecutionContext } from '@cloudflare/workers-types';
import { MethodNotAllowedError, NotFoundError } from '@cloudflare/kv-asset-handler/dist/types';
import {
  isAPiURL,
  isAssetURL,
  isSSR,
  logWorkerEnd,
  logWorkerStart,
  logger,
} from '@cfw-vue-ai/utils';
import { Api as api } from './api';
import { handleStaticAssets } from './static-assets';
import { handleSsr } from './ssr';

const FILE_LOG_LEVEL = 'debug';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      logWorkerStart(request);
      return await handleFetchEvent(request, env, ctx);
    } catch (e) {
      console.error(e);
      if (e instanceof NotFoundError) {
        return new Response('Not Found', { status: 404 });
      } else if (e instanceof MethodNotAllowedError) {
        return new Response('Method Not Allowed', { status: 405 });
      } else {
        return new Response(JSON.stringify(e), { status: 500 });
      }
    }
  },
};

async function handleFetchEvent(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  // const resp = new Response('');
  const resp = new Response('', { cf: request.cf });
  const log = logger(FILE_LOG_LEVEL, env);
  const path = url.pathname;
  let res;
  switch (true) {
    case isAssetURL(url):
      // must early return or assets missing
      return await handleStaticAssets(request, env, ctx);
    case isAPiURL(url):
      log(`[worker] index.handleFetchEvent -> ${env.VITE_API_VERSION} -> ${url.pathname}`);
      res = await api.handle(request, resp, env, ctx);
      log(`[worker] index.handleFetchEvent -> api response`);
    // logObjs([res, res.headers]);
    default:
      // this is only logged on page reload due to client routing
      log(
        `[worker] handleFetchEvent ${url.pathname} is SSR ${isSSR(
          url,
          env.SSR_BASE_PATHS.split(',')
        )}`
      );
      res =
        (await handleSsr(request, resp, env, ctx)) ?? new Response('Not Found', { status: 404 });
  }
  logWorkerEnd(request, res);
  return res;
}
