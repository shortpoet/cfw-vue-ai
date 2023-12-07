import type { AuthConfig as BaseAuthConfig } from '@auth/core/types';
import Cookies from 'universal-cookie';
import { Cookie, SessionStore } from '@auth/core/lib/cookie';
import { Provider } from '@auth/core/providers';

import { Env, UserRole } from 'types/index';
import {
  getCookieAuthToken,
  logSignin,
  shouldTrustHost,
  uuidv4,
  logger,
  logObjs
} from '@/ai-maps-util/index';
import { deriveDatabaseAdapter, getDatabaseFromEnv, KyselyAdapter, q } from '@/db/src';
import { fromDate } from '../credentials/authorize';
import { getSessionAndUser } from '@/db/src/v1/queries';
import { deriveAuthProviders, deriveSecretsFromEnv } from '.';

const FILE_LOG_LEVEL = 'debug';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SESSION_UPDATE_AGE = 60 * 60 * 24; // 24 hours
enum SessionStrategy {
  JWT = 'jwt',
  Database = 'database'
}
const SESSION_STRATEGY = SessionStrategy.Database;
const AUTH_ROUTE_PREFIX = '/api/auth';
const ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING = true;
const AUTH_CONFIG_DEBUG = true;
const SESSION_COOKIE_NAME = 'next-auth.session-token';
export {
  SESSION_MAX_AGE,
  SESSION_UPDATE_AGE,
  SessionStrategy,
  SESSION_STRATEGY,
  AUTH_ROUTE_PREFIX,
  ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING
};
export interface AuthConfig extends BaseAuthConfig {
  /**
   * Defines the base path for the auth routes.
   * If you change the default value,
   * you must also update the callback URL used by the [providers](https://authjs.dev/reference/core/modules/providers).
   *
   * @default '/api/auth'
   */
  prefix?: string;
  providers: Provider[] | any[];
}

const deriveAuthConfig = async (
  req: Request,
  res: Response,
  env: Env,
  options: Partial<AuthConfig>
): Promise<{
  authConfig: AuthConfig;
  isAuthAvailable: () => boolean;
  isGlobalReadOnly: () => boolean;
}> => {
  const log = logger(FILE_LOG_LEVEL, env);
  log(`[worker] auth.config -> \n`);

  const providers = deriveAuthProviders(env);
  const adapter = deriveDatabaseAdapter(env) as ReturnType<typeof KyselyAdapter>;
  const { secret } = await deriveSecretsFromEnv(env);
  const isAuthAvailable = () => !!secret && providers.length > 0 && !!adapter;
  const isGlobalReadOnly = () => !isAuthAvailable() && !!process.env.CLOUDY_READ_ONLY;
  options.secret ??= secret;
  // options.trustHost ??= shouldTrustHost();
  return {
    authConfig: {
      debug: AUTH_CONFIG_DEBUG,
      trustHost: true,
      secret,
      ...options,
      // useSecureCookies: process.env.NODE_ENV === "production",
      session: {
        strategy: SESSION_STRATEGY,
        maxAge: SESSION_MAX_AGE,
        updateAge: SESSION_UPDATE_AGE
      },
      providers,
      adapter,
      callbacks: {
        signIn: async ({ user, account, profile, email, credentials }) => {
          log(`[worker] auth.config -> callbacks.signIn -> \n`);
          logSignin(user, account, profile, email, credentials);
          try {
            const parsedUrl = new URL(req.url);
            const prefix = AUTH_ROUTE_PREFIX;
            // console.log(req);
            const isApi = parsedUrl.pathname.startsWith(`${prefix}/`);
            const [action, type] = parsedUrl.pathname.slice(prefix.length + 1).split('/');
            console.log(action);
            console.log(type);
            const db = getDatabaseFromEnv(env);
            if (!db) return false;
            const cookieName = SESSION_COOKIE_NAME;
            const sessionToken = getCookieAuthToken(req, 'cookie', cookieName) || '';
            const sessionExpiry = fromDate(SESSION_MAX_AGE);
            const userAndSession = await getSessionAndUser(sessionToken, db);
            log(`[worker] auth.config -> callbacks.signIn -> userAndSession -> \n`);
            console.log(userAndSession);
            if (isApi && action === 'callback' && req.method === 'POST') {
              if (userAndSession && user) return true;
              if (user) {
                log(`[worker] auth.config -> callbacks.signIn -> user -> \n`);
                const sessionToken = uuidv4();
                await q.createSession(
                  {
                    sessionToken: sessionToken,
                    userId: user.id,
                    expires: sessionExpiry
                  },
                  db
                );
                const dbSession = await q.getSession(sessionToken, db);
                if (dbSession) req.session = dbSession;
                return true;
              }
            }

            const cookies = new Cookies(req, { path: '/' });
            log(`[worker] auth.config -> callbacks.signIn -> cookies -> \n`);
            // console.log(cookies);
            log(
              `[worker] auth.config -> callbacks.signIn setting -> "next-auth.session-token" to -> \n`
            );
            console.log(sessionToken);
            cookies.set(SESSION_COOKIE_NAME, sessionToken, {
              expires: sessionExpiry
            });
            res.headers.set(SESSION_COOKIE_NAME, sessionToken);
            // req.user = user;
            if (user) {
              const roleUser = await q.getRoleUser(user.id, db);
              log(
                `[worker] auth.config -> callbacks.signIn -> SET user and session on REQ\n`
              );
              req.user = roleUser;
            }
            return true;
          } catch (error) {
            console.log(`[worker] auth.config -> callbacks.signIn -> error -> \n`);
            console.error(error);
            return true;
          }
        },
        jwt: async ({ token, user, account, session }) => {
          log(`[worker] auth.config -> callbacks.jwt -> \n`);
          logObjs([token, user, account, session]);
          const db = getDatabaseFromEnv(env);
          if (!db) return token;
          const sessionToken = req.session?.sessionToken || '';
          // return null;
          const sessionAndUser = await getSessionAndUser(sessionToken, db);
          log(`[worker] auth.config -> callbacks.jwt -> sessionAndUser -> \n`);
          console.log(sessionAndUser);
          return { sessionToken, ...session };
        },
        // user ? { ...token, id: user.id, token: { role: user.role } } : token,
        session: async ({ session, token }) => {
          log(`[worker] auth.config -> callbacks.session -> \n`);
          // console.log(session);
          let user;
          if (session?.user && session?.user?.email && adapter.getUserByEmail) {
            user = await adapter.getUserByEmail(session?.user?.email);
          }
          log(`[worker] auth.config -> callbacks.session -> user -> \n`);
          // console.log(user);
          console.log('isAdmin');
          console.log(user?.roles?.includes(UserRole.Admin));
          return user
            ? {
                ...session,
                token,
                user: { ...session.user, ...user, token }
              }
            : { ...session, token };
        }
      },
      events: {
        createUser: async ({ user }) => {
          let isAdmin = false;
          log(`[worker] auth.config -> events.createUser -> \n`);
          // console.log(user);
          const idAsNumber = Number(user.id);
          if (idAsNumber === 1) {
            isAdmin = true;
            log(
              `[worker] auth.config -> events.createUser -> user -> ${user.id} -> IS ADMIN`
            );
            await q.setUserIsAdmin(user.id, isAdmin, env);
          }
        },
        signIn: async ({ user, account, profile, isNewUser }) => {
          log(`[worker] auth.config -> events.signIn -> isNewUser -> ${isNewUser} \n`);
          console.log(user);
          const _account = await q.getAccountByUserId(user.id, env);
          // console.log(_account);
          if (user) {
            const db = getDatabaseFromEnv(env);
            if (!db) return;
            const roleUser = await q.getRoleUser(user.id, db);
            log(
              `[worker] auth.config -> callbacks.signIn -> SET user and session on REQ\n`
            );
            req.user = roleUser;
          }
          if (
            !!account?.access_token &&
            (_account?.access_token === null || _account?.access_token === '')
          ) {
            log(
              `[worker] auth.config -> events.signIn -> update account access token -> ${account?.access_token}\n`
            );
            q.updateAccount(
              _account?.id || '',
              { access_token: account?.access_token },
              env
            );
          }
        }
      }
    },
    isAuthAvailable,
    isGlobalReadOnly
  };
};

export { deriveAuthConfig };
