import colors from 'kleur';
import * as log from '../log';
import { Config, WrangleConfig } from '../types';
import { executeWranglerCommand, formatBindingId, getToml, writeToml } from '../util';
import { writeNamespaceToToml } from './toml';
import { createNamespace, getNamespace } from './namespace';

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
  console.log(colors.cyan(`[wrangle] [kv] bindingId ${bindingId}`));
  const namespace = getNamespace(bindingId, { ...opts, goLive: true });
  console.log(colors.blue(`[wrangle] [kv] namespace ${namespace}`));
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
