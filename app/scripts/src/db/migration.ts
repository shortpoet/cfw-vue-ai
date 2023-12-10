import colors from 'kleur';
import { executeWranglerCommand } from '../util';
import { Config } from '../types';

export function createMigration(
  databaseName: string,
  migrationName: string,
  opts: Pick<Config, 'env' | 'debug' | 'wranglerFile'>
) {
  console.log(
    colors.green(
      `[wrangle] [db] creating migration for [database name] ${databaseName} [mig name] ${migrationName}`
    )
  );
  const res = executeWranglerCommand(`d1 migrations create ${databaseName} ${migrationName}`, opts);
  if (!res) {
    throw new Error('no response');
  }
  if (res.includes('error')) {
    throw new Error(res);
  }
  console.log(res);
  const migration = res.match(/'(.*)'!/g);
  if (!migration) {
    throw new Error('no migration id in response');
  }
  const migrationId = migration[0].replace(/'\!/g, '');
  console.log(
    colors.green(
      `[wrangle] [db] created migration [name] ${migrationName} for database [name] ${databaseName}`
    )
  );
  console.log(res);
  return migrationId;
}

export function applyMigration(
  databaseName: string,
  opts: Pick<Config, 'env' | 'debug' | 'wranglerFile' | 'databaseName'>
) {
  console.log(colors.green(`[wrangle] [db] applying to database [name] ${databaseName}`));
  let localSwitch = '';
  if (opts.env === 'qa' || opts.env === 'dev') {
    localSwitch = `--local`;
  }

  const res = executeWranglerCommand(`d1 migrations apply ${databaseName} ${localSwitch}`, opts);
  if (!res) {
    throw new Error('no response');
  }
  if (res.includes('error')) {
    throw new Error(res);
  }
  console.log(res);
  return res;
}
