import colors from 'kleur';

import { Options } from '../types';
import * as log from '../log';
import { getConfig } from './config';

export default async function (opts: Options) {
  log.info('Retrieving Config');
  log.print('green', `${colors.cyan(log.ARROW)} opts`);
  console.info(JSON.stringify(opts));
  const conf = await getConfig(opts);
  log.info('[command] [build] Building:');
}
