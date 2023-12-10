import { decode, encode } from '@auth/core/jwt';
import type { JWTOptions, JWTEncodeParams, JWT } from '@auth/core/jwt';

export { JWTOptions, decode, encode, initJWT };

const initJWT = async (env: Env, token?: JWT) => {
  const secret = env.NEXTAUTH_SECRET;
  const salt = env.__SECRET__ || '__Secure-next-auth.session-token';
  const maxAge = 30 * 24 * 60 * 60; // 30 days
  const jwt: JWTEncodeParams = {
    salt,
    secret,
    maxAge,
    token,
  };

  const d = await decode({ ...jwt, token: token?.sessionToken, salt });

  const decoded = await decode({ ...jwt, token: token?.sessionToken });
  console.log(`[api] auth.middleware.itty.handleNextAuth.decoded`);
  console.log(decoded);
  return { jwt, decoded };
};
