import colors from 'kleur';
import { Config } from '../types';
import { getToml, writeToml } from '../util';
import * as log from '../log';

export async function assertTomlEnv(
  conf: Pick<Config, 'env' | 'wranglerFile' | 'appName' | 'debug'>
) {
  console.log(
    colors.green(`[wrangle] [toml] Asserting toml env ${conf.env} in ${conf.wranglerFile}`)
  );
  const { env, wranglerFile, appName, debug } = conf;
  let config = await getToml(conf.wranglerFile);
  if (!config) {
    throw new Error('no config');
  }
  // console.log(config);
  const defaultConfig = {
    name: appName,
    compatibility_date: '2023-11-21',
    node_compat: false,
    workers_dev: false,
    main: './build/worker.mjs',
    site: {
      bucket: '../ui/build/client',
      // entry_point: 'index.html',
      // include: ['dist/*'],
    },
    dev: {
      port: 3000,
      // hot: true,
      // watch: {
      //   ignore: ['node_modules/**/*'],
      // },
    },
    env: {},
  };
  config = { ...defaultConfig, ...config };
  const defaultEnvConfig = {
    name: appName,
    // route: `https://${appName}.workers.dev/*`,
  };
  if (!config['env'][`${env}`]) {
    log.print('green', `[toml] [config] Creating env:`);
    config['env'][`${env}`] = defaultEnvConfig;
  }
  // config['env'][`${env}`] =
  //   env != 'dev' ? { ...defaultEnvConfig, ...config['env'][`${env}`] } : config['env'][`${env}`];
  if (config['vars']) config['env'][`${env}`]['vars'] = config['vars'];
  // console.log(config);
  await writeToml(config, { wranglerFile, debug, appName, env });
}
