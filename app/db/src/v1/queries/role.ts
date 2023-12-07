import type { AdapterUser } from '@auth/core/adapters';
import { ExpressionBuilder, InsertQueryBuilder, InsertResult, Kysely } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';

import { User, UserRole, UserType, UserUnion } from 'types/index';
import { Database, getDatabaseFromEnv } from '..';
import { format, propertiesToFormat } from '../cast';
const { to, from } = format;
const isSqlite = true;

// if (roles.cache.some(role => config.adminRoles.includes(role.id))) {
//   // ...
//  }

export function withRoles(eb: ExpressionBuilder<Database, 'User'>) {
  return jsonArrayFrom(
    eb
      .selectFrom('UserRoleAssignment')
      .innerJoin('UserRole', 'UserRole.id', 'UserRoleAssignment.roleId')
      .select('UserRole.role')
      .whereRef('User.id', '=', 'UserRoleAssignment.userId')
  ).as('roles');
}

type UserResult = Omit<UserUnion, 'roles'> & { roles: { role: UserRole }[] };

export function withRoleResult(result: UserResult) {
  const temp: Omit<User, 'roles'> = result;
  let out: any;
  propertiesToFormat.forEach((property) => {
    if (property === 'created_at' || property === 'updated_at' || property === 'emailVerified') {
      out = format.to(temp, property);
    }
  });
  console.log(`[db] [queries] getRoleUser -> result -> \n`);
  console.log(result);
  console.log(`[db] [queries] getRoleUser -> result.roles -> \n`);
  console.log(result.roles);
  // return { ...out, roles: result.roles };
  return { ...out, roles: result.roles.map((role: { role: UserRole }) => role.role) };
}

export const getUserRoleAssignments = async (userId: string, db: Kysely<Database>) => {
  console.log(`[db] [queries] getUserRoleAssignments -> userId -> ${userId}`);
  const result = await db
    .selectFrom('UserRoleAssignment')
    .selectAll()
    .where('userId', '=', userId)
    .execute();
  return result;
};

export const deleteUserRoleAssignment = async (userId: string, db: Kysely<Database>) => {
  console.log(`[db] [queries] deleteUserRoleAssignment -> userId -> ${userId}`);
  const result = await db.deleteFrom('UserRoleAssignment').where('userId', '=', userId).execute();
  return result;
};

export const getUserRoles = async (userId: string, db: Kysely<Database>) => {
  console.log(`[db] [queries] getUserRoles -> userId -> ${userId}`);
  const result = await db
    .selectFrom('UserRoleAssignment')
    .innerJoin('UserRole', 'UserRole.id', 'UserRoleAssignment.roleId')
    .select('UserRole.role')
    .where('userId', '=', userId)
    .execute();
  return result;
};

export const getRole = async (role: UserRole, db: Kysely<Database>) => {
  console.log(`[db] [queries] getRole -> role -> ${role}`);
  const result = await db
    .selectFrom('UserRole')
    .selectAll()
    .where('role', '=', role)
    .executeTakeFirst();
  console.log(`[db] [queries] getRole -> result -> \n`);
  console.log(result);
  return result;
};

export const createUserRoleAssignment = async (
  userId: string,
  role: UserRole,
  db: Kysely<Database>,
  internal: boolean = false
) => {
  console.log(`[db] [queries] createUserRoleAssignment -> userId -> ${userId} -> role -> ${role}`);
  const { adapter } = db.getExecutor();
  const supportsReturning = adapter.supportsReturning;
  const dbRole = await getRole(role, db);
  const roleId = dbRole?.id || '';
  console.log(`[db] [queries] createUserRoleAssignment -> roleId -> ${roleId}`);
  const propertiesToFormat: (keyof Database['UserRoleAssignment'])[] = ['created_at', 'updated_at'];
  let roleData: any = {
    userId,
    roleId,
    created_at: new Date(),
    updated_at: new Date(),
  };
  propertiesToFormat.forEach((property) => {
    roleData = format.from(roleData, property, isSqlite) as any;
  });
  console.log(roleData);
  const query = db.insertInto('UserRoleAssignment').values(roleData);
  const result = supportsReturning
    ? await query.returningAll().executeTakeFirstOrThrow()
    : await query.executeTakeFirstOrThrow().then(async () => {
        return await db
          .selectFrom('UserRoleAssignment')
          .selectAll()
          .where('userId', '=', `${userId}`)
          .executeTakeFirstOrThrow();
      });
  return to(result, 'created_at');
};

export async function getRoleUser(id: string, db: Kysely<Database>) {
  console.log(`[db] [queries] getRoleUser -> id -> ${id}`);
  const result = await db
    .selectFrom('User')
    .selectAll('User')
    // .innerJoin('UserRoleAssignment', 'User.id', 'UserRoleAssignment.userId')
    // .innerJoin('UserRole', 'UserRole.id', 'UserRoleAssignment.roleId')
    // .select('UserRole.role')
    // .where((eb) =>
    //   eb.and({
    //     'User.id': id,
    //     'UserRoleAssignment.userId': id,
    //     'UserRole.id': eb.ref('UserRoleAssignment.roleId')
    //   })
    // )
    .select((eb) => [
      // jsonObjectFrom(
      //   eb
      //     .selectFrom('User')
      //     .select(['id', 'name', 'email', 'emailVerified', 'userType'])
      //     .where('User.id', '=', id)
      // ).as('user'),
      withRoles(eb),
    ])
    .executeTakeFirstOrThrow();
  const temp: Omit<User, 'roles'> = result;
  let out: any;
  propertiesToFormat.forEach((property) => {
    if (property === 'created_at' || property === 'updated_at' || property === 'emailVerified') {
      out = format.to(temp, property);
    }
  });
  return { ...out, roles: result.roles.map((r) => r.role) };
}
