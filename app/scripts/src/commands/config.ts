import { resolve } from 'node:path';
import { Config, Options } from '../types';

import { __wranglerDir } from '../root';
import { assert } from '../util';

export function getConfig(opts: Options): Config {
  opts.cwd = resolve(opts.cwd as Options['cwd']);

  const dir = opts.dir || resolve(__wranglerDir);
  assert(dir, `[wrangle] Workers directory does not exist: "${dir}"`, true);

  const cwd = opts.cwd || process.cwd();
  const env = opts.env || 'dev';
  const debug = opts.debug || false;
  const only = opts.only;
  const ignore = opts.ignore;

  const envFile = env === 'dev' ? `${dir}/.env` : `${dir}/.env.${env}`;
  const wranglerFile = env === 'dev' ? `${dir}/wrangler.toml` : `${dir}/wrangler.${env}.toml`;

  return { cwd, dir, env, debug, only, ignore, envFile, wranglerFile };
}
