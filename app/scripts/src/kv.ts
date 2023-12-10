import { WrangleConfig, executeWranglerCommand } from './util';

export function getNamespaces(env: WrangleConfig) {
  return JSON.parse(executeWranglerCommand('kv:namespace list', env.env));
}
