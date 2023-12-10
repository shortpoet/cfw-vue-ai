import { resolve } from 'node:path';
import * as dotenv from 'dotenv';

import * as log from '../log';

import { Config, Options, WranglerToml, WrangleConfig } from '../types';
import { __appDir, __rootDir, __wranglerDir } from '@cfw-vue-ai/types/src/root';
import { assert, formatBindingId, getToml, writeToml } from '../util';
import { setSecrets } from '../secret/secret';
// import { setBindings } from '../cf/name';
// import * as log from '../log';

const __dataDir = `${__appDir}/data`;
export const gitDataPath = `${__dataDir}/git.json`;
export const ssrDir = `${__appDir}/ui/src/pages`;
export const secretsFilePath = `${__rootDir}/.dev.vars`;

async function assertTomlEnv(conf: Pick<Config, 'env' | 'wranglerFile' | 'appName' | 'debug'>) {
  const { env, wranglerFile, appName, debug } = conf;
  let config = await getToml(conf.wranglerFile);
  if (!config) {
    throw new Error('no config');
  }
  if (!config['env']) {
    log.print('green', `[toml] [config] Creating env:`);
    config['env'] = {};
  }
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
  };
  config = { ...defaultConfig, ...config };
  const defaultEnvConfig = {
    name: appName,
    // route: `https://${appName}.workers.dev/*`,
  };
  // if (!config['env'][`${env}`]['name']) {
  //   config['env'][`${env}`]['name'] = appName;
  // }
  config['env'][`${env}`] =
    env != 'dev' ? { ...defaultEnvConfig, ...config['env'][`${env}`] } : config['env'][`${env}`];
  if (config['vars']) config['env'][`${env}`]['vars'] = config['vars'];
  // console.log(config);
  await writeToml(config, { wranglerFile, debug });
}

export async function getConfig(opts: Options): Promise<Config> {
  opts.cwd = resolve(opts.cwd as Options['cwd']);

  const dir = opts.dir || resolve(__wranglerDir);
  assert(dir, `[wrangle] [config] Workers directory does not exist: "${dir}"`, true);

  const cwd = opts.cwd || process.cwd();
  const goLive = opts.goLive || false;
  const env = opts.env || 'dev';
  const debug = opts.debug || false;
  const only = opts.only;
  const ignore = opts.ignore;

  const wranglerFile = env === 'dev' ? `${dir}/wrangler.toml` : `${dir}/wrangler.${env}.toml`;
  const envFile = env === 'dev' ? `${__appDir}/.env` : `${__appDir}/.env.${env}`;

  assert(envFile, `[wrangle] [config] Env file does not exist: "${envFile}"`, true);
  assert(wranglerFile, `[wrangle] [config] Wrangler file does not exist: "${wranglerFile}"`, true);

  const envVars = dotenv.config({
    path: envFile,
  }).parsed;
  if (!envVars) {
    throw new Error(`[wrangle] [command] [vars] No config found in ${envFile}`);
  }

  const appName = process.env.VITE_APP_NAME;
  assert(appName, `[wrangle] [config] No app name found`, false);
  log.print('cyan', `[wrangle] [config] App name: ${appName}`);
  const secrets = {
    __SECRET__: `Cloud/auth0/${appName}/${env}/__SECRET__`,
    NEXTAUTH_SECRET: `Cloud/nextauth/${appName}/${env}/NEXTAUTH_SECRET`,
    GITHUB_CLIENT_ID: `Github/oauth/${appName}/${env}/GITHUB_CLIENT_ID`,
    GITHUB_CLIENT_SECRET: `Github/oauth/${appName}/${env}/GITHUB_CLIENT_SECRET`,
    EMAIL_SERVER_PASSWORD: `Mail/fastmail/ai-maps-nodemailer`,
    JMAP_TOKEN: `Mail/fastmail/ai-maps-email-send-token`,
  };

  // TODO add to build
  // await setSecrets(secrets, secretsFilePath, { env, debug, wranglerFile });
  // assert(
  //   secretsFilePath,
  //   `[wrangle] [config] Secret file does not exist: "${secretsFilePath}"`,
  //   true
  // );

  await assertTomlEnv({ env, wranglerFile, appName, debug });
  // assert(appName, `[wrangle] [config] No app name found`, false);

  const bindingNameBase = `${appName.toUpperCase().replace(/-/g, '_')}`;
  const bindingNameSuffixes = [
    'UI',
    // "SESSIONS", "USERS", "MAPS"
  ];
  const bindingNameDb = `${bindingNameBase}_DB_V1`;
  const bindingNameUI = `${bindingNameBase}_UI`;
  const bindingIdDb = formatBindingId(
    { appName, env, bindingNameUI, bindingNameDb },
    { isUI: false }.isUI
  );
  const bindingIdUi = formatBindingId(
    { appName, env, bindingNameUI, bindingNameDb },
    { isUI: true }.isUI
  );
  const databaseName = bindingIdDb;

  assert(bindingNameDb, `[wrangle] [config] No binding name found`, false);
  assert(bindingIdDb, `[wrangle] [config] No binding id found`, false);
  assert(databaseName, `[wrangle] [config] No database name found`, false);

  return {
    cwd,
    goLive,
    dir,
    env,
    debug,
    only,
    ignore,
    envFile,
    wranglerFile,
    secrets,
    envVars,
    appName,
    bindingNameUI,
    bindingNameDb,
    databaseName,
    bindingIdUi,
  };
}
