import { decode, encode } from '@auth/core/jwt';
import type { JWTOptions } from '@auth/core/jwt';
import { Env, Session } from 'types/index';

export { JWTOptions, decode, encode, initJWT };
const initJWT = async (env: Env, token?: string) => {
  const secret = env.NEXTAUTH_SECRET;
  const maxAge = 30 * 24 * 60 * 60; // 30 days
  const jwt: JWTOptions = {
    secret,
    maxAge,
    encode,
    decode
  };

  const decoded = await jwt.decode({ ...jwt, token });
  console.log(`[worker] auth.middleware.itty.handleNextAuth.decoded`);
  console.log(decoded);
};
