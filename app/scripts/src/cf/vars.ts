import fs from 'fs';
import * as log from '../log';
import { getToml, writeToml } from '../util';
import path from 'node:path';
import { WrangleConfig } from '../types';

export async function setVars(
  conf: WrangleConfig,
  envVars: Record<string, string>,
  ssrDir: string,
  secrets: Record<string, string>
) {
  const { envFile, wranglerFile, debug } = conf;
  const ssrDirs = fs
    .readdirSync(ssrDir)
    .map((dir) => path.join(ssrDir, dir).split('/').pop())
    .join(',');

  const config = await getToml(wranglerFile);
  if (!config && !config['env'] && !config['env'][`${conf.env}`]) {
    throw new Error(`no config found at ${wranglerFile}`);
  }
  console.log(config);
  log.print('green', `[setVars] Setting vars for ${conf.env} -> ${wranglerFile}`);

  const env = conf.env;
  Object.keys(secrets).forEach((key) => {
    delete config[key];
  });
  const newVars: Record<string, string> = {
    ...config['env'][`${env}`]['vars'],
    ...envVars,
    SSR_BASE_PATHS: ssrDirs,
  };
  Object.keys(secrets).forEach((key) => {
    delete newVars[key];
  });
  log.print('blue', '[wrangle] newVars');
  const newConf = {
    ...config,
    env: {
      ...config['env'],
      [`${env}`]: {
        ...config['env'][`${env}`],
        vars: newVars,
      },
    },
  };
  console.log(newConf);
  writeToml(newConf, { wranglerFile, debug });
}
