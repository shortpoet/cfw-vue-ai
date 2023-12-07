import { Kysely } from 'kysely';
import type { JWT, JWTDecodeParams, JWTOptions } from '@auth/core/jwt';
import { encode, decode } from '@auth/core/jwt';
import { AdapterAccount, AdapterSession, AdapterUser } from '@auth/core/adapters';

import { Database } from '@/db/src/v1';

import { Env, UserRole, UserType } from '@/types';
import { getDatabaseFromEnv, q } from '@/db/src';
import { User } from '@auth/core/types';
// import jwt from "@auth/core/jwt";
import { getSessionAndUser, getUser } from '@/db/src/v1/queries';
import { getCookieAuthToken, uuidv4 } from 'ai-maps-util/index';
import {
  ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING,
  SESSION_STRATEGY,
  SessionStrategy
} from '../config/config';

export function fromDate(time: number, date = Date.now()) {
  return new Date(date + time * 1000);
}

const { type, provider, providerAccountId } = {
  providerAccountId: '8',
  provider: 'credentials',
  type: 'email' as 'email' | 'oauth' | 'oidc'
};

const linkAccount = async (userId: string, db: Kysely<Database>) => {
  let account: AdapterAccount;

  const tokenSet = {
    access_token: '',
    expires_at: 0,
    id_token: '',
    refresh_token: '',
    scope: '',
    session_state: '',
    token_type: ''
  };
  const defaults = {
    providerAccountId,
    provider,
    type,
    userId,
    ...tokenSet
  };

  account = Object.assign(tokenSet ?? {}, defaults);
  await q.linkAccount({ ...account, userId }, db);
};
export const authorize = async (
  { email, password }: Partial<Record<'email' | 'password', unknown>>,
  request: Request,
  env: Env,
  sessionMaxAge = 30 * 24 * 60 * 60
): Promise<User | null> => {
  let session: AdapterSession | JWT | null = null;
  let user = null;
  let isNewUser = false;
  let options = {};
  options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  };
  console.log('credentials.authorize.request');
  try {
    const db = getDatabaseFromEnv(env);
    if (!db) return null;
    const useJwtSession = SESSION_STRATEGY === (SessionStrategy.JWT as SessionStrategy);
    const userByAccount = await q.getUserByAccount(
      {
        providerAccountId,
        provider
      },
      db
    );

    const cookieName = 'next-auth.session-token';
    const sessionToken = getCookieAuthToken(request, 'cookie', cookieName);
    if (sessionToken) {
      if (useJwtSession) {
        // console.log(
        //   `[worker] [credentials] [authorize] [sessionToken] use JWT ${sessionToken}`
        // );
        try {
          const secret = env.NEXTAUTH_SECRET;
          const maxAge = 30 * 24 * 60 * 60; // 30 days
          const jwt: JWTOptions = {
            secret,
            maxAge,
            encode,
            decode
          };
          session = await jwt.decode({ ...jwt, token: sessionToken });
          // console.log(
          //   "[worker] [credentials] [authorize] [sessionToken] decoded JWT",
          //   session
          // );
          if (session && 'sub' in session && session.sub) {
            user = await getUser(session.sub, db);
            if (user) {
              const userAndSession = await q.getSessionAndUser(sessionToken, db);
              if (userAndSession) {
                session = userAndSession.session;
                user = userAndSession.user;
              }
            }
          } else {
          }
        } catch (error) {
          console.log(
            '[worker] [credentials] [authorize] [sessionToken] JWT decode error'
          );
          console.error(error);
          // If session can't be verified, treat as no session
        }
      } else {
        const userAndSession = await getSessionAndUser(sessionToken, db);
        if (userAndSession) {
          session = userAndSession.session;
          user = userAndSession.user;
          if (session && user) {
            console.log('[worker] [credentials] [authorize]  by getSessionAndUser', user);
            return user;
          }
        }
      }
    }
    if (userByAccount) {
      if (user) {
        // If the user is already signed in with this account, we don't need to do anything
        console.log(
          `[worker] [credentials] [authorize] user by account already signed in`
        );
        console.log(user);
        console.log(`[worker] [credentials] [authorize] session`);
        console.log(session);
        if (userByAccount.id === user.id) return user;
        throw new OAuthAccountNotLinked(
          'The account is already associated with another user',
          { provider, providerAccountId }
        );
      }
      session = useJwtSession
        ? {}
        : await q.createSession(
            {
              sessionToken: uuidv4(),
              userId: userByAccount.id,
              expires: fromDate(sessionMaxAge)
            },
            db
          );
      user = userByAccount;
      console.log(`[worker] [credentials] [authorize] user by account`);
      console.log(user);
      console.log(`[worker] [credentials] [authorize] session`);
      console.log(session);
      console.log(`[worker] [credentials] [authorize] isNewUser -> ${isNewUser}`);
      return user;
    } else {
      if (user) {
        // If the user is already signed in and the OAuth account isn't already associated
        // with another user account then we can go ahead and link the accounts safely.
        await linkAccount(user.id, db);
        console.log(
          `[worker] [credentials] [authorize] user already signed in but account not linked`
        );
        console.log(user);
        console.log(`[worker] [credentials] [authorize] session`);
        console.log(session);
        return user;
      }
      if (email && typeof email === 'string') {
        const userByEmail = await q.getUserByEmail(email, env);
        if (userByEmail) {
          if (ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING) {
            // If you trust the oauth provider to correctly verify email addresses, you can opt-in to
            // account linking even when the user is not signed-in.
            user = userByEmail;
          } else {
            // We end up here when we don't have an account with the same [provider].id *BUT*
            // we do already have an account with the same email address as the one in the
            // OAuth profile the user has just tried to sign in with.
            //
            // We don't want to have two accounts with the same email address, and we don't
            // want to link them in case it's not safe to do so, so instead we prompt the user
            // to sign in via email to verify their identity and then link the accounts.
            throw new OAuthAccountNotLinked(
              'Another account already exists with the same e-mail address',
              { provider, providerAccountId }
            );
          }
        } else {
          // If the current user is not logged in and the profile isn't linked to any user
          // accounts (by email or provider account id)...
          //
          // If no account matching the same [provider].id or .email exists, we can
          // create a new account for the user, link it to the OAuth account and
          // create a new session for them so they are signed in with it.
          isNewUser = true;
          user = await q.createUser(
            {
              email,
              emailVerified: null,
              userType: UserType.Credentials
            },
            db
          );
        }
        if (!user) return null;
        console.log('[worker] [credentials] [authorize] created user', user);
        // const session = await q.createSession(
        session = useJwtSession
          ? {}
          : await q.createSession(
              {
                sessionToken: uuidv4(),
                userId: user.id,
                expires: fromDate(sessionMaxAge)
              },
              db
            );

        console.log('[worker] [credentials] [authorize] session', session);
        return user;
      }
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

interface ErrorCause extends Record<string, unknown> {}

export class AuthError extends Error {
  constructor(message: string | Error | ErrorCause, cause?: ErrorCause) {
    if (message instanceof Error) {
      super(undefined, {
        cause: { err: message, ...(message.cause as any), ...cause }
      });
    } else if (typeof message === 'string') {
      if (cause instanceof Error) {
        cause = { err: cause, ...(cause.cause as any) };
      }
      super(message, cause);
    } else {
      super(undefined, message);
    }
    Error.captureStackTrace?.(this, this.constructor);
    this.name = message instanceof AuthError ? message.name : this.constructor.name;
  }
}

export class OAuthAccountNotLinked extends AuthError {}
