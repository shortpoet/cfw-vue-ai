import colors from 'kleur';

import { Options } from '../types';
import * as log from '../log';
import { getConfig, gitDataPath, secretsFilePath } from '../config/config';
import { setSecrets } from '../secret/secret';
import { assert } from '../util';
import { build } from '../bild/build-worker';
import { __appDir } from '@/types/src/root';
import { setBindings } from '../cf/kv';
import { setVars } from '../cf/vars';
import { setGitconfig } from '../git/git';
import { assertDatabase } from '../db/db';
import { applyMigration } from '../db/migration';

export default async function (opts: Options) {
  log.info('Retrieving Config');
  log.print('green', `${colors.cyan(log.ARROW)} opts`);
  console.info(JSON.stringify(opts));
  const conf = await getConfig(opts);
  const {
    env,
    secrets,
    appName,
    wranglerFile,
    debug,
    envVars,
    databaseName,
    goLive,
    bindingNameDb,
    bindingNameUI,
  } = conf;
  log.info('[command] [build] Building:');
  // TODO add to build
  await setSecrets(secrets, secretsFilePath, { env, debug, wranglerFile });
  assert(
    secretsFilePath,
    `[wrangle] [config] Secret file does not exist: "${secretsFilePath}"`,
    true
  );
  const entry = `${__appDir}/api/src/index.ts`;
  const out = `${__appDir}/api/build/worker.mjs`;
  build({ entry, out, debug });

  // const { env, appName, wranglerFile, debug, goLive, bindingNameDb, bindingNameUI } = conf;
  const bindingNameBase = `${appName.toUpperCase().replace(/-/g, '_')}`;
  const bindingNameSuffixes = [
    'UI',
    // "SESSIONS", "USERS", "MAPS"
  ];
  await setBindings(bindingNameBase, bindingNameSuffixes, conf);

  const ssrDir = `${__appDir}/ui/src/pages`;
  assert(ssrDir, `[wrangle] [command] [vars] SSR directory does not exist: "${ssrDir}"`, true);
  log.info('[command] [vars] Setting Vars:');
  await setVars(conf, envVars, ssrDir, secrets);

  assert(
    gitDataPath,
    `[wrangle] [command] [vars] gitDataPath directory does not exist: "${gitDataPath}"`,
    true
  );
  log.info('[command] [vars] Setting Vars:');
  await setGitconfig(gitDataPath, conf);

  log.info('[command] [db] Creating - Asserting Database:');
  assertDatabase(conf);

  log.info('[command] [db] Applying Migration:');
  // migration smoothly sasserted by sade
  // return;
  applyMigration(databaseName, conf);
}
