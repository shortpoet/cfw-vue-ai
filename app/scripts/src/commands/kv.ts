import colors from 'kleur';
import * as utils from '../util';
import * as log from '../log';
import { createNamespace, deleteNamespace, getNamespaces, setBindings } from '../cf/kv';
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

export async function deleteKV(opts: Options) {
  log.info('Retrieving Config');
  log.print('green', `${colors.cyan(log.ARROW)} opts`);
  console.info(JSON.stringify(opts));
  const conf = await getConfig(opts);
  log.info('Deleting KV namespace:');
  if (!opts.bindingName) {
    // throw new Error('no binding name');
    opts.bindingName = utils.formatBindingId(conf, { isUi: true }.isUi);
  }
  const res = await deleteNamespace(opts.bindingName, conf);
}

export async function create(opts: Options) {
  log.info('Retrieving Config');
  log.print('green', `${colors.cyan(log.ARROW)} opts`);
  console.info(JSON.stringify(opts));
  const conf = await getConfig(opts);
  log.info('Creating KV namespace:');
  const { env, appName, wranglerFile, debug, goLive, bindingNameDb, bindingNameUI } = conf;
  const bindingNameBase = `${appName.toUpperCase().replace(/-/g, '_')}`;
  const bindingNameSuffixes = [
    'UI',
    // "SESSIONS", "USERS", "MAPS"
  ];

  await setBindings(bindingNameBase, bindingNameSuffixes, conf);
  // const res = await createNamespace(opts.bindingName, conf);
}
