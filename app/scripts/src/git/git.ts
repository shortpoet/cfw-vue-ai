import { formatBindingId, writeFile } from '../util';
import * as log from '../log';
import { Config } from '../types';
import getGitInfo from './get-git-info';
import { writeKV } from '../cf/kv';

export async function setGitconfig(gitDataPath: string, opts: Config) {
  const bindingId = formatBindingId(opts, { isUi: true }.isUi);
  log.print(
    'green',
    `Getting from data path ${gitDataPath} and Setting git commit for binding Id ${bindingId}`
  );
  const key = 'gitInfo';
  const commitStr = await getGitInfo();
  writeKV(opts.bindingNameUI, key, commitStr, opts);
  log.print(
    'magenta',
    `Writing git commit to KV ID ${bindingId} in ${opts.env} env -> path -> ${gitDataPath}`
  );
  writeFile(gitDataPath, commitStr);
}
