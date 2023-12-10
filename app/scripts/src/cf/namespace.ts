import * as log from '../log';
import { Config, WrangleConfig } from '../types';
import { executeWranglerCommand, formatBindingId, getToml, writeToml } from '../util';
import colors from 'kleur';
import { writeNamespaceToToml } from './toml';

export function getNamespaces(opts: Config) {
  return JSON.parse(executeWranglerCommand('kv:namespace list', opts));
}

export function getNamespace(id: string, opts: Config) {
  const n = getNamespaces(opts);
  return n.find((i: any) => i.title === id);
}

export function getPreview(id: string, opts: Config) {
  return getNamespaces(opts).find((i: any) => i.title === `${id}_preview`);
}

export function createNamespace(bindingName: string, opts: Config) {
  const cmd = `kv:namespace create ${bindingName}`;
  const cmdPrev = `kv:namespace create ${bindingName} --preview`;
  // if (debug) process.exit(0);
  console.log(colors.cyan(`[wrangle] [kv] creating namespace ${bindingName}`));
  const res = executeWranglerCommand(cmd, opts);
  console.log(colors.cyan(res));
  const resPrev = executeWranglerCommand(cmdPrev, opts);
  console.log(colors.cyan(resPrev));
}

export function deleteNamespace(bindingName: string, opts: Config) {
  console.log(colors.cyan(`[wrangle] [kv] deleting namespace ${bindingName}`));

  const bindingId = formatBindingId(opts, { isUi: true }.isUi);
  console.log(colors.cyan(`[wrangle] [kv] bindingId ${bindingId}`));
  const namespace = getNamespace(bindingId, { ...opts, goLive: true });
  if (!namespace) {
    throw new Error(`[wrangle] [kv] no namespace for binding ${bindingName}`);
  }
  console.log(colors.blue(`[wrangle] [kv] namespace ${namespace}`));
  const namespaceId = namespace.id;
  console.log(colors.cyan(`[wrangle] [kv] deleting namespace ${namespaceId}`));
  const cmd = `kv:namespace delete --namespace-id=${namespaceId}`;
  const res = executeWranglerCommand(cmd, opts);
  console.log(colors.cyan(res));
}
