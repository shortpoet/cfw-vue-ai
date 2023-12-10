import type { AuthAction } from '@auth/core/types';
import { Auth } from '@auth/core';
import { ExecutionContext } from '@cloudflare/workers-types';
// import { Session } from '@auth/core/types';
import { Session } from '@cfw-vue-ai/types';
import { IRequest } from 'itty-router';
import { ACTIONS, AuthConfig, SESSION_STRATEGY, deriveAuthConfig } from '.';

const FILE_LOG_LEVEL = 'debug';
import { logger, logObjs } from '@cfw-vue-ai/utils';
/**
 * Create an express/connect compatible Auth.js middleware.
 *
 * @example
 *
 * ```ts
 * import express from 'express'
 * import { createAuthMiddleware } from 'authey'
 *
 * const app = express()
 * app.use(createAuthMiddleware({
 *   secret: process.env.AUTH_SECRET,
 *   trustHost: process.env.AUTH_TRUST_HOST,
 *   providers: [{}]
 * }))
 * ```
 *
 * @param options - [Auth.js](https://authjs.dev/reference/configuration/auth-config#options) options.
 */

export const createAuthRequest = async (
  req: Request,
  res: Response,
  env: Env,
  optionsInit: Partial<AuthConfig>
) => {
  const log = logger(FILE_LOG_LEVEL, env);

  const { authConfig, isAuthAvailable } = await deriveAuthConfig(req, res, env, optionsInit);
  log(`[api] [middleware] [auth] [itty] createAuthRequest -> NEW \n`);
  const parsedUrl = new URL(req.url);
  const referrer = req.headers.get('referer');
  const origin = `${parsedUrl.origin}/`;
  let callbackUrl;
  if (referrer && !referrer.includes('/api/auth') && referrer !== origin) {
    log(
      `[api] [middleware] [auth] [itty] createAuthRequest -> setting callbackUrl to referrer -> ${referrer} -> but not ${origin} \n}`
    );
    callbackUrl = referrer;
    const replacementParams = new URLSearchParams({ callbackUrl: referrer });
    // parsedUrl.search = replacementParams.toString();
    parsedUrl.searchParams.set('callbackUrl', callbackUrl);
  }

  const init: RequestInit = {
    headers: req.headers,
    method: req.method,
    body: req.body,
    // @ts-expect-error: Internal. Check https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1483
    duplex: 'half',
  };
  const request = new Request(parsedUrl, init);
  // logObjs([authConfig, init]);
  const response = await Auth(request, authConfig);
  return response;
};
export const authMiddlewareItty = async (
  req: IRequest | Request,
  res: Response,
  env: Env,
  context: ExecutionContext
) => {
  const log = logger(FILE_LOG_LEVEL, env);
  try {
    log(`[api] auth.middleware.itty -> START\n`);
    // console.log(req.headers);
    const prefix = '/api/auth';
    const optionsInit: Partial<AuthConfig> = { prefix };
    const parsedUrl = new URL(req.url);
    const isApi = parsedUrl.pathname.startsWith(`${prefix}/`);
    const [action] = parsedUrl.pathname.slice(prefix.length + 1).split('/');
    // const port = parsedUrl.port;
    // const origin = parsedUrl.origin;
    // const uri = origin.includes("localhost")
    //   ? `http://192.168.1.79:${port}/api/auth/${action}`
    //   : // ? 'http://[::1]:3000/api/auth/${action}'
    //     `${origin}/api/auth/${action}`;

    const protectedRoutes = [
      // ''
      '/api/health/debug',
    ];

    if (ACTIONS.includes(action as AuthAction) && isApi) {
      const session = await getSessionItty(req, res, env);
      res.session = session;
      log(`[api] auth.middleware.itty -> auth action -> ${action}`);
      const response = await createAuthRequest(req, res, env, optionsInit);
      const logNoBody = Object.entries(response).reduce((acc, [key, value]) => {
        if (key === 'body') return acc;
        return { ...acc, [key]: value };
      }, {} as any);
      // log(`[api] [middleware] [auth] [itty] handleNextAuth.response | user | session`);
      // logObjs([logNoBody]);
      // logObjs([req.user, req.session]);
      if (action === 'callback' && req.method === 'POST') {
        // handle credentials Callback
        log(
          `[api] [middleware] [auth] [itty] handleNextAuth -> callback -> POST -> credentials callback SET ON RESPONSE\n`
        );
        if (req && req.session && req.session.sessionToken && SESSION_STRATEGY === 'database') {
          const protocol = parsedUrl.protocol;
          const cookieName =
            protocol === 'https:' ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
          const isCookieSecure = protocol === 'https:' ? 'Secure;' : '';
          const newCookie = `${cookieName}=${req.session.sessionToken}; Path=/; HttpOnly; ${isCookieSecure} SameSite=Lax`;
          log(
            `[api] [middleware] [auth] [itty] handleNextAuth -> callback -> POST -> credentials callback SET ON RESPONSE -> ${newCookie}\n`
          );
          res.headers.append('Set-Cookie', newCookie);
        }
      }
      res.session = session ?? null;
      return response;
    }
    return;
  } catch (error) {
    log(`[api] [middleware] [auth] [itty] error`);
    console.error(error);
    return;
  }
};

export async function getSessionItty(
  req: IRequest | Request,
  res: Response,
  env: Env
): Promise<Session | null> {
  const log = logger(FILE_LOG_LEVEL, env);
  log(`[api] [middleware] [auth] [itty] getSessionItty -> START\n`);
  const prefix = '/api/auth';
  const optionsInit: Partial<AuthConfig> = { prefix };
  const { authConfig, isAuthAvailable } = await deriveAuthConfig(req, res, env, optionsInit);
  const url = new URL(`${prefix}/session`, req.url);
  try {
    const request = new Request(url, { headers: req.headers });
    if (!isAuthAvailable()) {
      throw new Error('Auth is not available');
    }
    log(
      `[api] [middleware] [auth] [itty] getSessionItty.authRequest -> ${req.method}://.${url.pathname}`
    );
    const response = await Auth(request, authConfig);
    const { status = 200 } = response;
    const session: Session | any = await response.body.json();
    log(`[api] [middleware] [auth] [itty] getSessionItty.response -> session`);
    console.log(session);
    if (!session || !Object.keys(session).length) return null;
    if (status === 200) {
      // set("session", data);
      // const setCookies = response.headers.get("set-cookie");
      // if (setCookies) {
      //   set("set-cookie", setCookies);
      // }
      // const csrfToken = response.headers.get("next-auth.csrf-token");
      // const callbackUrl = response.headers.get("next-auth.callback-url");
      // if (csrfToken) set("csrf-token", csrfToken.split("|")[0]);
      // if (callbackUrl) set("callback-url", callbackUrl);
      return session;
    }
    throw new Error(session.message);
  } catch (error) {
    console.error(`[api] [middleware] [auth] [itty] getSessionItty.error`);
    console.error(error);
    return null;
  }
}
