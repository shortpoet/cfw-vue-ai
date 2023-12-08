import { Kysely } from 'kysely';
import { Database } from '../db';
import { format, propertiesToFormat } from '../cast';
import { User, UserRole, UserType } from '@cfw-vue-ai/types';
const to = format.to;
const isSqlite = true;

import { getRoleUser } from '.';
const FILE_LOG_LEVEL = 'debug';

export const createSession = async (
  session: {
    sessionToken: string;
    userId: string;
    expires: Date;
  },
  db: Kysely<Database>
) => {
  const { adapter } = db.getExecutor();
  const supportsReturning = adapter.supportsReturning;
  console.log(`[db] [queries] createSession -> session -> \n`);
  // console.console.log(session);
  console.log(`[db] [queries] createSession -> sessionToken -> ${session.sessionToken}`);
  const propertiesToFormat: (keyof Database['Session'])[] = ['expires', 'created_at', 'updated_at'];
  let sessionData: any = {
    ...session,
    created_at: new Date(),
    updated_at: new Date(),
  };
  propertiesToFormat.forEach((property) => {
    sessionData = format.from(sessionData, property, isSqlite) as any;
  });

  const query = db.insertInto('Session').values(sessionData);
  const result = supportsReturning
    ? await query.returningAll().executeTakeFirstOrThrow()
    : await (async () => {
        await query.executeTakeFirstOrThrow();
        return await db
          .selectFrom('Session')
          .selectAll()
          .where('sessionToken', '=', sessionData.sessionToken)
          .executeTakeFirstOrThrow();
      })();
  return to(result, 'expires');
};

export async function getSession(sessionToken: string, db: Kysely<Database>) {
  console.log(`[db] [queries] getSession -> sessionToken -> ${sessionToken}`);
  const result = await db
    .selectFrom('Session')
    .selectAll()
    .where('sessionToken', '=', sessionToken)
    .executeTakeFirst();

  if (!result) return null;

  return to(result, 'expires');
}

export async function getSessionAndUser(sessionTokenArg: string, db: Kysely<Database>) {
  console.log(`[db] [queries] getSessionAndUser -> sessionToken -> ${sessionTokenArg}`);
  const result = await db
    .selectFrom('Session')
    .innerJoin('User', 'User.id', 'Session.userId')
    .selectAll('User')
    .select([
      'Session.id as sessionId',
      'Session.userId',
      'Session.sessionToken',
      'Session.expires',
    ])
    .where('Session.sessionToken', '=', sessionTokenArg)
    .executeTakeFirst();

  if (!result) return null;

  const { sessionId: id, userId, sessionToken, expires, ...user } = result;
  const roleUser = await getRoleUser(id, db);
  const temp: Omit<User, 'roles'> = { ...roleUser, ...user };
  let out: any;
  out = { ...result, ...temp };
  console.log(`[db] [queries] createUser -> result -> \n`);
  propertiesToFormat.forEach((property) => {
    if (
      property === 'id' ||
      property === 'created_at' ||
      property === 'updated_at' ||
      property === 'emailVerified'
    ) {
      out = format.to(temp, property);
    }
  });

  return {
    user: { ...out, roles: roleUser.roles },
    session: format.to({ id, userId, sessionToken, expires }, 'expires'),
  };
}

export async function updateSession(session: any, db: Kysely<Database>) {
  console.log(`[db] [queries] updateSession -> session -> \n`);
  // console.console.log(session);
  const sessionData = format.from(
    {
      ...session,
    },
    'expires',
    isSqlite
  );

  const query = db
    .updateTable('Session')
    .set(sessionData)
    .where('Session.sessionToken', '=', session.sessionToken);

  const result = await query.returningAll().executeTakeFirstOrThrow();

  return format.to(result, 'expires');
}

export async function deleteSession(sessionToken: string, db: Kysely<Database>) {
  console.log(`[db] [queries] deleteSession -> sessionToken -> ${sessionToken}`);
  await db
    .deleteFrom('Session')
    .where('Session.sessionToken', '=', sessionToken)
    .executeTakeFirstOrThrow();
}
