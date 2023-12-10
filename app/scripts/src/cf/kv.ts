import { WrangleConfig } from '../types';
import { executeWranglerCommand } from '../util';

export function getNamespaces(conf: WrangleConfig) {
  return JSON.parse(executeWranglerCommand('kv:namespace list', conf.env, conf.wranglerFile));
}
