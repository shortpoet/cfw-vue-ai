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
  const conf = await getConfig(opts);
  log.info('Retrieving KV namespaces:');
  const items = await getNamespaces(conf);
  log.printList(items, ['id', 'title', 'supports_url_encoding']);
}
