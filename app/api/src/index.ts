/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { ExecutionContext } from "@cloudflare/workers-types";
import handleProxy from "./middleware/proxy";
import handleRedirect from "./middleware/redirect";
import {
  MethodNotAllowedError,
  NotFoundError,
} from "@cloudflare/kv-asset-handler/dist/types";
import {
  isAPiURL,
  isAssetURL,
  logWorkerEnd,
  logWorkerStart,
  logger,
} from "./utils";
import { Api as api } from "./api";

const FILE_LOG_LEVEL = "debug";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      logWorkerStart(request);
      return await handleFetchEvent(request, env, ctx);
    } catch (e) {
      console.error(e);
      if (e instanceof NotFoundError) {
        return new Response("Not Found", { status: 404 });
      } else if (e instanceof MethodNotAllowedError) {
        return new Response("Method Not Allowed", { status: 405 });
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
  const resp = new Response("", { cf: request.cf });
  const log = logger(FILE_LOG_LEVEL, env);
  const path = url.pathname;
  let res;
  switch (true) {
    case path === "/redirect":
      return handleRedirect.fetch(request, env, ctx);
    case path === "/proxy":
      return handleProxy.fetch(request, env, ctx);
    case isAPiURL(url):
      log(
        `[worker] index.handleFetchEvent -> ${env.WORKER_ENVIRONMENT} -> ${url.pathname}`
      );
      res = await api.handle(request, resp, env, ctx);
      log(`[worker] index.handleFetchEvent -> api response ${true}`);
      // logObjs([res, res.headers]);
      logWorkerEnd(request, res);
      return res;
    default:
      return new Response(
        `Try making requests to:
        <ul>
        <li><code><a href="/redirect?redirectUrl=https://example.com/">/redirect?redirectUrl=https://example.com/</a></code>,</li>
        <li><code><a href="/proxy?modify&proxyUrl=https://example.com/">/proxy?modify&proxyUrl=https://example.com/</a></code>, or</li>
        <li><code><a href="/api/hello">/api/hello</a></code></li>,
        <li><code><a href="/api/json-data">/api/json-data</a></code></li>,
        <li><code><a href="/api/docs">/api/docs</a></code></li>`,
        { headers: { "Content-Type": "text/html" } }
      );
  }
}
