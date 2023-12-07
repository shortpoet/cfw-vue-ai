import { Kysely, ParseJSONResultsPlugin } from 'kysely';
import { D1Dialect } from 'kysely-d1';

import * as q from './queries';
import { Database } from './db';
import { KyselyAdapter } from './adapter';

export * from './db';
export * from './adapter';
export { q };

const getDatabaseFromEnv = (env: Env) => {
  const d1 = env.CFW_VUE_AI_DB;
  if (d1) {
    return new Kysely<Database>({
      dialect: new D1Dialect({ database: d1 }),
      // plugins: [new CamelCasePlugin()],
      plugins: [new ParseJSONResultsPlugin()],
    });
  }
  return undefined;
};

const deriveDatabaseAdapter = (env: Env) => {
  const db = getDatabaseFromEnv(env);
  if (db) {
    return KyselyAdapter(db, {}, env);
  }
  return undefined;
};

export { getDatabaseFromEnv, deriveDatabaseAdapter };
