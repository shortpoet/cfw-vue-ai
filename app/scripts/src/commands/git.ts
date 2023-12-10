import colors from 'kleur';
import * as log from '../log';
import { setVars } from '../cf/vars';
import { getConfig, gitDataPath } from './config';
import { Options } from '../types';
import { __appDir, __rootDir, __wranglerDir } from '@cfw-vue-ai/types';
import { assert } from '../util';
import { setGitconfig } from '../git/git';

export async function set(opts: Options) {
  log.info('[command] [git] Retrieving Config');
  log.print('green', `${colors.cyan(log.ARROW)} opts`);
  console.info(JSON.stringify(opts));
  // console.log(opts);
  const conf = await getConfig(opts);
  assert(
    gitDataPath,
    `[wrangle] [command] [vars] SSR directory does not exist: "${gitDataPath}"`,
    true
  );
  await setGitconfig(gitDataPath, conf);
  log.info('[command] [vars] Setting Vars:');
}
