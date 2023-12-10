import * as log from '../log';
import { Config, WrangleConfig } from '../types';
import { executeWranglerCommand, formatBindingId, getToml, writeToml } from '../util';
import colors from 'kleur';

export function getNamespaces(opts: Config) {
  return JSON.parse(executeWranglerCommand('kv:namespace list', opts));
}

function getNamespace(id: string, opts: Config) {
  const n = getNamespaces(opts);
  return n.find((i: any) => i.title === id);
}

function getPreview(id: string, opts: Config) {
  return getNamespaces(opts).find((i: any) => i.title === `${id}_preview`);
}

export function createNamespace(bindingName: string, opts: Config) {
  const cmd = `kv:namespace create ${bindingName}`;
  const cmdPrev = `kv:namespace create ${bindingName} --preview`;
  // if (debug) process.exit(0);
  console.log(colors.cyan(`[wrangle] [kv] creating namespace ${bindingName}`));
  if (!opts.goLive) return;
  const res = executeWranglerCommand(cmd, opts);
  console.log(colors.cyan(res));
  const resPrev = executeWranglerCommand(cmdPrev, opts);
  console.log(colors.cyan(resPrev));
}

export function deleteNamespace(bindingName: string, opts: Config) {
  console.log(colors.cyan(`[wrangle] [kv] deleting namespace ${bindingName}`));

  const bindingId = formatBindingId(opts, { isUi: true }.isUi);
  console.log(colors.cyan(`[wrangle] [kv] bindingId ${bindingId}`));
  const namespaceId = getNamespace(bindingId, opts).id;
  console.log(colors.cyan(`[wrangle] [kv] deleting namespace ${namespaceId}`));
  // const cmd = `kv:namespace delete --namespace-id=${namespaceId}`;
  // const res = executeWranglerCommand(cmd, opts);
  // console.log(colors.cyan(res));
}

export async function setBindings(
  bindingNameBase: string,
  bindingNameSuffixes: string[],
  opts: Config
) {
  const { env, appName, wranglerFile, debug } = opts;
  for (const suffix of bindingNameSuffixes) {
    const bindingName = `${bindingNameBase}_${suffix}`;
    if (debug || process.env.VITE_LOG_LEVEL === 'debug') {
      console.log(colors.cyan(`[wrangle] [kv]  bindingName ${bindingName}`));
      // KV_DEBUG = true;
    }
    assertBinding(bindingName, opts);
  }
}

async function assertBinding(bindingName: string, opts: Config) {
  log.print('green', `[wrangle] [kv] Asserting kv bindings for ${bindingName} in env ${opts.env}`);
  const bindingId = formatBindingId(opts, { isUi: true }.isUi);
  const namespace = getNamespace(bindingId, opts);
  if (!namespace) {
    createNamespace(bindingName, opts);
  }
  if (opts.goLive) {
    await writeNamespaceToToml(bindingName, opts);
  }
}

export function writeKV(bindingName: string, key: string, value: string, opts: Config) {
  assertBinding(bindingName, opts);
  const bindingId = formatBindingId(opts, { isUi: true }.isUi);
  const namespaceId = getNamespace(bindingId, opts).id;
  const cmd = `kv:key put --namespace-id=${namespaceId} '${key}' '${value}'`;
  if (opts.debug) {
    log.print(
      'magenta',
      `[wrangle] [kv] bindingId: ${bindingId}
    [wrangle] [kv] { "${key}": "${value}" }`
    );
  }
  const res = executeWranglerCommand(cmd, opts);
  console.log(res);
}

async function writeNamespaceToToml(bindingName: string, opts: Config) {
  const bindingId = formatBindingId(opts, { isUi: true }.isUi);
  const namespace = getNamespace(bindingId, opts);
  if (!namespace) {
    throw new Error(`[wrangle] [kv] no namespace for binding ${bindingName}`);
  }
  const namespaceId = namespace.id;
  const previewId = getPreview(bindingId, opts).id;
  console.log(
    colors.green(
      `[wrangle] [kv] Writing binding ${bindingName} to toml ${opts.wranglerFile}
       [wrangle] [kv] namespaceId: ${namespaceId}
       [wrangle] [kv] previewId: ${previewId}`
    )
  );
  // updateToml(`env.${env}.kv_namespaces.0.title`, id);
  const config = await getToml(opts.wranglerFile);
  if (!config) {
    throw new Error('no config');
  }

  let kv_namespaces = config['env'][`${opts.env}`]['kv_namespaces'];

  if (!kv_namespaces) {
    kv_namespaces = [];
  }
  const kv_namespace = kv_namespaces.find((i) => i.binding === bindingName);
  if (kv_namespace && kv_namespace.id === namespaceId && kv_namespace.preview_id === previewId) {
    log.print('yellow', `[kv] binding ${bindingName} already exists in toml ${opts.wranglerFile}`);
    return;
  }
  kv_namespaces = kv_namespaces.concat({
    binding: bindingName,
    id: namespaceId,
    preview_id: previewId,
  });
  config['env'][`${opts.env}`]['kv_namespaces'] = kv_namespaces;
  writeToml(config, opts);
}
