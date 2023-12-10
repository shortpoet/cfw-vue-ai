import colors from 'kleur';
import * as utils from '../util';
import * as log from '../log';
import { getNamespaces } from '../cf/kv';
import { getConfig } from './config';
import { Argv, Options } from '../types';

export async function list(opts: Options) {
  log.info('Retrieving Config');
  log.print('green', `${colors.cyan(log.ARROW)} opts`);
  console.info(JSON.stringify(opts));
  // console.log(opts);
  const { cwd, dir, env, debug, only, ignore, envFile, wranglerFile } = getConfig(opts);

  log.info('Retrieving KV namespaces:');
  const items = await getNamespaces({ env, envFile, debug, wranglerFile });
  const GAP = '    ',
    TH = colors.dim().bold().italic;
  log.success(TH('ID') + ' '.repeat(30) + GAP + TH('Title'));

  let i = 0,
    arr = items,
    tmp = ''; // ID => 32 chars
  for (; i < arr.length; i++) {
    if (tmp) tmp += '\n';
    tmp += (arr[i].supports_url_encoding ? colors.cyan : colors.red)(log.ARROW);
    tmp += arr[i].id + GAP + arr[i].title;
  }

  console.log(tmp);
}
