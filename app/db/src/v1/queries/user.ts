import type { AdapterUser } from '@auth/core/adapters';
import { ExpressionBuilder, InsertQueryBuilder, InsertResult, Kysely } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';

import { User, UserRole, UserType } from 'types/index';
import { Database, getDatabaseFromEnv } from '..';
import { format, propertiesToFormat } from '../cast';
const { to, from } = format;
const isSqlite = true;

import {
  createUserRoleAssignment,
  deleteUserRoleAssignment,
  getRoleUser,
  getUserRoles,
  withRoleResult,
  withRoles,
} from '.';
const FILE_LOG_LEVEL = 'debug';

// if (roles.cache.some(role => config.adminRoles.includes(role.id))) {
//   // ...
//  }

export const createUser = async (
  data: Omit<AdapterUser, 'id' | 'roles'>,
  db: Kysely<Database>
): Promise<AdapterUser> => {
  console.log(`[db] [queries] createUser -> data -> \n`);
  console.log(data);
  const { adapter } = db.getExecutor();
  const supportsReturning = adapter.supportsReturning;
  // let roles =
  //   data.name?.replace(' ', '') === 'CarlosSoriano' ? [UserRole.Admin] : [UserRole.User];

  let userData: any = {
    ...data,
    userType: UserType._,
    created_at: new Date(),
    updated_at: new Date(),
  };
  propertiesToFormat.forEach((property) => {
    userData = format.from(userData, property, isSqlite) as any;
  });
  const userQuery = db.insertInto('User').values(userData);
  const userResult = supportsReturning
    ? await userQuery.returningAll().executeTakeFirstOrThrow()
    : await userQuery.executeTakeFirstOrThrow().then(async () => {
        return await db
          .selectFrom('User')
          .selectAll()
          .where('email', '=', `${userData.email}`)
          .executeTakeFirstOrThrow();
      });

  const roleResult = await createUserRoleAssignment(userResult.id, UserRole.User, db, true);
  console.log(`[db] [queries] createUser -> userResult -> \n`);
  console.log(userResult);

  const r = await getRoleUser(userResult.id, db);
  const temp: Omit<User, 'roles'> = { ...r, ...userResult };

  let out: any;
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
  console.log(`[db] [queries] createUser -> out -> \n`);
  console.log(out);
  return { ...out, roles: r.roles };
};

export type UserResult = Promise<
  (Omit<any, 'emailVerified'> & Record<'emailVerified', Date>) | null
>;

export async function getUser(id: string, db: Kysely<Database>) {
  console.log(`[db] [queries] getUser -> id -> ${id}`);
  const result =
    (await db
      .selectFrom('User')
      .selectAll()
      .select((eb) => [withRoles(eb)])
      .where('id', '=', id)
      .executeTakeFirst()) ?? null;

  if (!result) return null;
  // unfortunately removes typing
  return withRoleResult(result);
}

export async function getUserByAccount(
  { providerAccountId, provider }: { providerAccountId: string; provider: string },
  db: Kysely<Database>
) {
  console.log(
    `[db] [queries] getUserByAccount -> providerAccountId -> ${providerAccountId} -> provider -> ${provider}`
  );
  const result =
    (await db
      .selectFrom('User')
      .innerJoin('Account', 'User.id', 'Account.userId')
      .selectAll('User')
      .select((eb) => [withRoles(eb)])
      .where('Account.providerAccountId', '=', providerAccountId)
      .where('Account.provider', '=', provider)
      .executeTakeFirst()) ?? null;

  if (!result) return null;

  const temp: Omit<User, 'roles'> = result;
  let out: any;
  propertiesToFormat.forEach((property) => {
    if (property === 'created_at' || property === 'updated_at' || property === 'emailVerified') {
      out = format.to(temp, property);
    }
  });

  return { ...out, roles: result.roles.map((r) => r.role) };
}

export const getUserById = async (id: string, env: Env) => {
  console.log(`[db] [queries] getUserById -> id -> ${id}`);
  const db = getDatabaseFromEnv(env);
  if (!db) return undefined;

  const resp = await db.selectFrom('User').selectAll().where('id', '=', id).executeTakeFirst();

  return resp;
  // return resp ? castKeysToBool(resp, ["disabled"]) : resp;
};

export const getAllUsers = async (env: Env) => {
  console.log(`[db] [queries] getAllUsers -> \n`);
  const db = getDatabaseFromEnv(env);
  if (!db) return undefined;
  const resp = await db.selectFrom('User').selectAll().execute();
  return resp;
};

export async function updateUser(
  { id, ...user }: { id: string; [key: string]: any },
  db: Kysely<Database>
) {
  console.log(`[db] [queries] updateUser -> id -> ${id} -> user -> \n`);
  console.log(user);
  if (!id) throw new Error('User not found');
  const { adapter } = db.getExecutor();
  const supportsReturning = adapter.supportsReturning;

  const userData = from(user, 'emailVerified', isSqlite);
  const query = db.updateTable('User').set(userData).where('id', '=', id);

  const result = supportsReturning
    ? await query.returningAll().executeTakeFirstOrThrow()
    : await query.executeTakeFirstOrThrow().then(async () => {
        return await db
          .selectFrom('User')
          .selectAll()
          .select((eb) => [withRoles(eb)])
          .where('id', '=', id)
          .executeTakeFirstOrThrow();
      });

  const roleUser = await getRoleUser(id, db);
  const temp: Omit<User, 'roles'> = { ...roleUser, ...result };
  let out: any;
  console.log(`[db] [queries] createUser -> result -> \n`);
  propertiesToFormat.forEach((property) => {
    if (property === 'created_at' || property === 'updated_at' || property === 'emailVerified') {
      out = format.to(temp, property);
    }
  });
  return { ...out, roles: roleUser.roles };
  // return to(result, 'emailVerified');
}

export const setUserIsAdmin = async (
  id: string,
  // id: User["id"],
  isAdmin: boolean,
  env: Env
) => {
  console.log(`[db] [queries] setUserIsAdmin -> id -> ${id} -> isAdmin -> ${isAdmin}`);
  const db = getDatabaseFromEnv(env);
  if (!db) return undefined;

  const currentRoleAssignments = (await getUserRoles(id, db)).map((r) => r.role);
  if (!currentRoleAssignments.includes(UserRole.Admin) && isAdmin) {
    return await createUserRoleAssignment(id, isAdmin ? UserRole.Admin : UserRole.User, db, true);
  } else if (currentRoleAssignments.includes(UserRole.Admin) && !isAdmin) {
    return await deleteUserRoleAssignment(id, db);
  }
};

export const getUserByEmail = async (email: string, env: Env) => {
  console.log(`[db] [queries] getUserByEmail -> email -> ${email}`);
  const db = getDatabaseFromEnv(env);
  if (!db) return null;
  const result =
    (await db
      .selectFrom('User')
      .selectAll()
      .select((eb) => [withRoles(eb)])
      .where('email', '=', email)
      .executeTakeFirst()) ?? null;
  if (!result) return null;
  const temp: Omit<User, 'roles'> = result;
  let out: any;
  propertiesToFormat.forEach((property) => {
    if (property === 'created_at' || property === 'updated_at' || property === 'emailVerified') {
      out = format.to(temp, property);
    }
  });
  return { ...out, roles: result.roles.map((r) => r.role) };
};

export async function deleteUser(userId: string, db: Kysely<Database>) {
  console.log(`[db] [queries] deleteUser -> userId -> ${userId}`);
  await db.deleteFrom('User').where('User.id', '=', userId).execute();
}
