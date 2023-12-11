import { Adapter } from '@auth/core/adapters';
import { Kysely } from 'kysely';

import { Database } from './db';
import {
  createSession,
  createUser,
  createVerificationToken,
  deleteSession,
  deleteUser,
  getSessionAndUser,
  getUser,
  getUserByAccount,
  getUserByEmail,
  linkAccount,
  unlinkAccount,
  updateSession,
  updateUser,
  useVerificationToken,
} from './queries';

export function KyselyAdapter(db: Kysely<Database>, options = {}, env: Env): Adapter {
  return {
    async createUser(data) {
      return createUser(data, db);
    },
    async getUser(id) {
      return getUser(id, db);
    },
    async getUserByEmail(email) {
      return await getUserByEmail(email, env);
    },
    async getUserByAccount({ providerAccountId, provider }) {
      return await getUserByAccount({ providerAccountId, provider }, db);
    },
    async updateUser({ id, ...user }) {
      return await updateUser({ id, ...user }, db);
    },
    async deleteUser(userId) {
      return await deleteUser(userId, db);
    },
    async linkAccount(account) {
      return await linkAccount(account, db);
    },
    async unlinkAccount({ providerAccountId, provider }) {
      return await unlinkAccount({ providerAccountId, provider }, db);
    },
    async createSession(data) {
      return createSession(data, db);
    },
    async getSessionAndUser(sessionTokenArg) {
      return getSessionAndUser(sessionTokenArg, db);
    },
    async updateSession(session) {
      return updateSession(session, db);
    },
    async deleteSession(sessionToken) {
      return await deleteSession(sessionToken, db);
    },
    async createVerificationToken(verificationToken) {
      return await createVerificationToken(verificationToken, db);
    },
    async useVerificationToken({ identifier, token }) {
      return await useVerificationToken({ identifier, token }, db);
    },
  };
}
