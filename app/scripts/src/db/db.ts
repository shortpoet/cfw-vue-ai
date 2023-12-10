import colors from 'kleur';
import { Config } from '../types';
import { executeWranglerCommand, formatBindingId } from '../util';
import { writeDatabaseToToml } from './toml';

export async function assertDatabase(
  opts: Pick<
    Config,
    'env' | 'debug' | 'wranglerFile' | 'bindingNameDb' | 'appName' | 'databaseName'
  >
) {
  const { bindingNameDb, wranglerFile, env, debug, appName, databaseName } = opts;
  console.log(
    colors.green(
      `[wrangle] [db] Asserting database bindings for ${bindingNameDb} in env ${env} wrangler env ${env} 
      \t\tapp ${appName} toml ${wranglerFile} debug ${debug}`
    )
  );
  let databaseId;
  const database = getDatabase(opts);
  console.log(database);
  databaseId = database.uuid;

  console.log(database);
  databaseId = database.uuid;
  console.log(databaseId);

  if (!databaseId) {
    console.log(colors.green(`[wrangle] [db] creating database ${databaseName}`));
    databaseId = createDatabase(opts);
  }
  console.log(colors.green(`[wrangle] [db] databaseId ${databaseId} for binding ${bindingNameDb}`));
  writeDatabaseToToml(databaseId, opts);
}

export function getDatabases(opts: Pick<Config, 'env' | 'debug' | 'wranglerFile'>) {
  try {
    return JSON.parse(executeWranglerCommand('d1 list --json', opts));
  } catch (error) {
    if (typeof error === 'string' && error.toString().includes('SyntaxError')) {
      return [];
    } else {
      throw error;
    }
  }
}

export function getDatabase(opts: Pick<Config, 'env' | 'debug' | 'wranglerFile' | 'databaseName'>) {
  const n = getDatabases(opts);
  console.log(colors.cyan(`[wrangle] [db] get name ${opts.databaseName}`));
  return n.find((i: any) => i.name === opts.databaseName) || {};
}

export function createDatabase(
  opts: Pick<Config, 'env' | 'debug' | 'wranglerFile' | 'databaseName'>
) {
  console.log(colors.green(`[wrangle] [db] creating database ${opts.databaseName}`));
  const res = executeWranglerCommand(`d1 create ${opts.databaseName}`, opts);
  if (!res) {
    throw new Error('no response');
  }
  if (res.includes('error')) {
    throw new Error(res);
  }
  const database = res.match(/(?<=database_id = ).*/g);
  if (!database) {
    throw new Error('no database id in response');
  }
  const databaseId = database[0].replace(/"/g, '');
  console.log(
    colors.green(`[wrangle] [db] created database [name] ${opts.databaseName} [id] ${databaseId}`)
  );
  console.log(res);
  return databaseId;
}

export function deleteDatabase(
  opts: Pick<Config, 'env' | 'debug' | 'wranglerFile' | 'databaseName'>
) {
  console.log(colors.green(`[wrangle] [db] deleting database ${opts.databaseName}`));
  const res = executeWranglerCommand(`d1 delete ${opts.databaseName}`, opts);
  if (!res) {
    throw new Error('no response');
  }
  if (res.includes('error')) {
    throw new Error(res);
  }
  console.log(res);
  return res;
}
