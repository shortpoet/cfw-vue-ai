import { renderPage } from 'vike/server';
import { ExecutionContext } from '@cloudflare/workers-types';
import { logger, tryLogHeaders, logObjs } from '@cfw-vue-ai/utils';

const FILE_LOG_LEVEL = 'debug';

export { handleSsr };

async function handleSsr(request: Request, res: Response, env: Env, ctx: ExecutionContext) {
  const log = logger(FILE_LOG_LEVEL, env);
  log(`[api] [ssr] handleSsr -> url -> ${request.url}`);
  const userAgent = request.headers.get('User-Agent') || '';
  const pageContextInit = {
    urlOriginal: request.url,
    fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
    userAgent,
    cf: request.cf,
  };
  const pageContext = await renderPage(pageContextInit);
  const { httpResponse } = pageContext;
  if (!httpResponse) {
    return null;
  } else {
    const { statusCode, contentType } = httpResponse;
    const { readable, writable } = new TransformStream();
    httpResponse.pipe(writable);
    return new Response(readable, {
      headers: { 'content-type': contentType },
      status: statusCode,
    });
  }
}
