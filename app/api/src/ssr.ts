import { renderPage } from 'vike/server';
import { ExecutionContext } from '@cloudflare/workers-types';
import { logger, tryLogHeaders, logObjs, getAuthCookies } from '@cfw-vue-ai/utils';
import { getSessionItty } from './middleware';
import { UserRole } from '@/types/src';

const FILE_LOG_LEVEL = 'debug';

export { handleSsr };

async function handleSsr(request: Request, res: Response, env: Env, ctx: ExecutionContext) {
  const log = logger(FILE_LOG_LEVEL, env);
  log(`[api] [ssr] handleSsr -> url -> ${request.url}`);
  const session = await getSessionItty(request, res, env);
  const cookieHeader = request.headers.get('cookie') || '';
  const { sessionToken, csrfToken, callbackUrl, pkceCodeVerifier } = getAuthCookies(cookieHeader);
  const userAgent = request.headers.get('User-Agent') || '';
  const pageContextInit = {
    urlOriginal: request.url,
    fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
    isAdmin: session?.user?.roles?.includes(UserRole.Admin) || false,
    userAgent,
    session,
    cf: request.cf,
    csrfToken,
    callbackUrl,
    // authRedirectUrl,
    sessionToken,
    pkceCodeVerifier,
  };
  console.log(`[api] [ssr] handleSsr -> pageContextInit ->`);
  logObjs([pageContextInit]);
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
