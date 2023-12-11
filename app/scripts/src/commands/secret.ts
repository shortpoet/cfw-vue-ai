import colors from 'kleur';
import * as log from '../log';
import { setVars } from '../cf/vars';
import { getConfig, secretsFilePath } from '../config/config';
import { Options } from '../types';
import { __appDir, __rootDir, __wranglerDir } from '@cfw-vue-ai/types/src/root';
import { assert } from '../util';
import { setSecrets } from '../secret/secret';

export async function set(opts: Options) {
  log.info('[command] [vars] Retrieving Config');
  log.print('green', `${colors.cyan(log.ARROW)} opts`);
  console.info(JSON.stringify(opts));
  // console.log(opts);
  const { envVars, env, debug, envFile, wranglerFile, secrets } = await getConfig(opts);
  const conf = { env, envFile, debug, wranglerFile };
  log.info('[command] [vars] Setting Vars:');
  await setSecrets(secrets, secretsFilePath, { env, debug, wranglerFile });
  assert(
    secretsFilePath,
    `[wrangle] [config] Secret file does not exist: "${secretsFilePath}"`,
    true
  );
}
