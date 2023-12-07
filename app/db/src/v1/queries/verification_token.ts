import { Kysely } from "kysely";

import { Env, UserRole, UserType } from "types/index";
import { Database, getDatabaseFromEnv } from "..";
import { format } from "../cast";
const { to, from } = format;
const isSqlite = true;

export async function createVerificationToken(
  verificationToken: any,
  db: Kysely<Database>
) {
  const { adapter } = db.getExecutor();
  const supportsReturning = adapter.supportsReturning;
  const verificationTokenData = from(verificationToken, "expires", isSqlite);
  const query = db
    .insertInto("VerificationToken")
    .values(verificationTokenData);

  const result = supportsReturning
    ? await query.returningAll().executeTakeFirstOrThrow()
    : await query.executeTakeFirstOrThrow().then(async () => {
        return await db
          .selectFrom("VerificationToken")
          .selectAll()
          .where("token", "=", verificationTokenData.token)
          .executeTakeFirstOrThrow();
      });

  return to(result, "expires");
}

export async function useVerificationToken(
  { identifier, token }: { identifier: string; token: string },
  db: Kysely<Database>
) {
  const { adapter } = db.getExecutor();
  const supportsReturning = adapter.supportsReturning;
  const query = db
    .deleteFrom("VerificationToken")
    .where("VerificationToken.token", "=", token)
    .where("VerificationToken.identifier", "=", identifier);

  const result = supportsReturning
    ? (await query.returningAll().executeTakeFirst()) ?? null
    : await db
        .selectFrom("VerificationToken")
        .selectAll()
        .where("token", "=", token)
        .executeTakeFirst()
        .then(async (res) => {
          await query.executeTakeFirst();
          return res;
        });

  if (!result) return null;

  return to(result, "expires");
}
