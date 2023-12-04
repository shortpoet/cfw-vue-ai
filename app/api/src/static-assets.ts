import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import { ExecutionContext } from '@cloudflare/workers-types';
import { setCacheOptions } from '@cfw-vue-ai/utils';

export { handleStaticAssets };
// @ts-expect-error
import rawManifest from '__STATIC_CONTENT_MANIFEST';

async function handleStaticAssets(request: Request, env: Env, ctx: ExecutionContext) {
  // console.log(`[worker] [static-assets] handleStaticAssets -> url -> ${request.url}`);
  const DEBUG = env.VITE_LOG_LEVEL === 'debug';
  let options = setCacheOptions(request, DEBUG);

  const getAssetFromKVArgs = {
    request,
    waitUntil(promise: Promise<any>) {
      return ctx.waitUntil(promise);
    },
  };

  try {
    try {
      options = {
        ...options,
        ASSET_NAMESPACE: '__STATIC_CONTENT' in env ? env.__STATIC_CONTENT : undefined,
        ASSET_MANIFEST:
          '__STATIC_CONTENT_MANIFEST' in env
            ? env.__STATIC_CONTENT_MANIFEST
            : JSON.parse(rawManifest),
      };
      const page = await getAssetFromKV(getAssetFromKVArgs, options);
      const response = new Response(page.body, page);
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('Referrer-Policy', 'unsafe-url');
      response.headers.set('Feature-Policy', 'none');
      // console.log(`[worker] [static-assets] handleStaticAssets -> response -> ${request.url}`);
      return response;
    } catch (error: any) {
      console.log('error getAssetFromKV', error);
      const msg = `Error thrown while trying to fetch getAssetFromKV ${request.url}: ${
        error.message || error.toString()
      }`;
      return new Response(msg, { status: 500 });
    }
  } catch (e: any) {
    // if an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        let notFoundResponse = await getAssetFromKV(getAssetFromKVArgs, {
          mapRequestToAsset: (req: Request) =>
            new Request(`${new URL(req.url).origin}/404.html`, req as RequestInit),
        });

        return new Response(notFoundResponse.body, {
          ...notFoundResponse,
          status: 404,
        });
      } catch (e: any) {
        console.log('error handleStaticAssets', e);
      }
    }
    const msg = `Error thrown while trying to fetch handleStaticAssets ${request.url}: ${
      e.message || e.toString()
    }`;
    return new Response(msg, { status: 500 });
  }
}
