import { Kysely, ParseJSONResultsPlugin } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { binding } from 'cf-bindings-proxy';

import * as q from './queries';
import { Database } from './db';
import { KyselyAdapter } from './adapter';
import { D1Database } from '@cloudflare/workers-types';

export * from './db';
export * from './adapter';
export { q };

const getDatabaseFromEnv = (env: Env) => {
  const d1 =
    env.WORKER_ENVIRONMENT === 'dev'
      ? binding<D1Database>(env.CFW_VUE_AI_DB_BINDING_NAME || 'CFW_VUE_AI_DB_LOCAL')
      : env.CFW_VUE_AI_DB;
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
