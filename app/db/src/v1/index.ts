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

const getDatabaseFromEnv = async (env: Env) => {
  const localBinding = env.CFW_VUE_AI_DB_BINDING_NAME || 'local-CFW_VUE_AI_DB_LOCAL';
  console.log(`[db] getDatabaseFromEnv -> localBinding: ${localBinding}`);
  const d1 =
    env.WORKER_ENVIRONMENT === 'dev' ? binding<D1Database>(localBinding) : env.CFW_VUE_AI_DB;
  if (d1) {
    console.log(`[db] getDatabaseFromEnv -> env: ${env.WORKER_ENVIRONMENT}`);
    console.log(`[db] getDatabaseFromEnv -> d1:`);
    console.log(d1);
    // const res = await d1.prepare(`SELECT * FROM Users`).all();
    // console.log(`[db] getDatabaseFromEnv -> res:`);
    // console.log(res);
    // if (!res) return undefined;

    return new Kysely<Database>({
      dialect: new D1Dialect({ database: d1 }),
      // plugins: [new CamelCasePlugin()],
      plugins: [new ParseJSONResultsPlugin()],
    });
  }
  return undefined;
};

const deriveDatabaseAdapter = async (env: Env) => {
  const db = await getDatabaseFromEnv(env);
  if (db) {
    return KyselyAdapter(db, {}, env);
  }
  return undefined;
};

export { getDatabaseFromEnv, deriveDatabaseAdapter };
