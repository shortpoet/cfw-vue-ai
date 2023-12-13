import { Kysely } from 'kysely';

import { UserRole, UserType } from '@cfw-vue-ai/types';
import { Database, getDatabaseFromEnv } from '..';
import { format } from '../cast';
const { to, from } = format;
const isSqlite = true;

export const getAccount = async (id: string, env: Env) => {
  const db = await getDatabaseFromEnv(env);
  if (!db) return undefined;

  const result =
    (await db.selectFrom('Account').selectAll().where('id', '=', id).executeTakeFirst()) ?? null;
  if (!result) return null;
  return result;
};

export const getAccountByUserId = async (userId: string, env: Env) => {
  const db = await getDatabaseFromEnv(env);
  if (!db) return undefined;

  const result =
    (await db.selectFrom('Account').selectAll().where('userId', '=', userId).executeTakeFirst()) ??
    null;
  if (!result) return null;
  return result;
};

export const updateAccount = async (id: string, data: Partial<Database['Account']>, env: Env) => {
  const db = await getDatabaseFromEnv(env);
  if (!db) return undefined;

  const resp = await db.updateTable('Account').set(data).where('id', '=', id).executeTakeFirst();
  if (!resp) return null;
  return resp;
};

export async function linkAccount(account: any, db: Kysely<Database>) {
  console.log(`[db] index -> adapter -> linkAccount -> \n`);
  await db.insertInto('Account').values(account).executeTakeFirstOrThrow();
  console.log(`[db] index -> adapter -> updateUser -> \n`);
  const res = await db
    .updateTable('User')
    .set(
      from(
        {
          emailVerified: new Date(),
          userType:
            account.provider === 'github'
              ? UserType.GitHub
              : account.provider === 'email'
                ? UserType.Email
                : UserType._,
        },
        'emailVerified',
        isSqlite
      )
    )
    .where('id', '=', account.userId)
    .executeTakeFirstOrThrow();
  console.log(res);
}

export async function unlinkAccount(
  { providerAccountId, provider }: { providerAccountId: string; provider: string },
  db: Kysely<Database>
) {
  await db
    .deleteFrom('Account')
    .where('Account.providerAccountId', '=', providerAccountId)
    .where('Account.provider', '=', provider)
    .executeTakeFirstOrThrow();
}
