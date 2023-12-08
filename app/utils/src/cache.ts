import type { Options } from '@cloudflare/kv-asset-handler';
import { ExecutionContext } from '@cloudflare/workers-types';
export { setCacheOptions };

function setCacheOptions(request: Request, DEBUG: boolean) {
  let options: Partial<Options> = {};
  const url = new URL(request.url);
  let browserTTL = 60 * 60 * 24 * 365; // 365 days
  let edgeTTL = 60 * 60 * 24 * 2; // 2 days

  if (DEBUG) {
    options.cacheControl = {
      bypassCache: true,
    };
  } else {
    options.cacheControl = {
      browserTTL,
      edgeTTL,
      bypassCache: false,
    };
  }

  return options;
}

async function cacheResponse(
  req: Request,
  env: Env,
  ctx: ExecutionContext,
  options: {
    cache?: Cache;
    cacheTTL: number;
  }
): Promise<Response> {
  console.log('worker.cacheResponse');
  // const cache = options?.cache || caches.default;
  // const cacheTTL = options?.cacheTTL || env.CACHE_TTL;
  // const cacheKey = new Request(req.url.toString(), req);
  // cacheKey.headers.set("Cache-Control", `max-age=${cacheTTL}`);
  const cacheUrl = new URL(req.url);
  // Construct the cache key from the cache URL
  const cacheKey = new Request(cacheUrl.toString(), req);
  // @ts-expect-error
  const cache = caches.default;
  cacheKey.headers.set('Cache-Control', `s-max-age=${options.cacheTTL}`);
  let res = await cache.match(cacheKey);
  if (!res) {
    console.log(
      `res for request url: ${req.url} not present in cache. Fetching and caching request.`
    );
    // If not in cache, get it from origin
    res = await fetch(req);
    // Must use res constructor to inherit all of res's fields
    res = new Response(res.body, res);
    // Cache API respects Cache-Control headers. Setting s-max-age to 10
    // will limit the res to be in cache for 10 seconds max
    // Any changes made to the res here will be reflected in the cached value
    res.headers.append('Cache-Control', 's-maxage=10');
    ctx.waitUntil(cache.put(cacheKey, res.clone()));
  } else {
    console.log(`Cache hit for: ${req.url}.`);
  }
  console.log('worker.cacheResponse');
  console.log(`final res for request url: ${req.url} is: ${JSON.stringify(res, null, 2)}`);
  return res;
}
