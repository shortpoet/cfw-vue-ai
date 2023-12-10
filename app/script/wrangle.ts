import path, { dirname } from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import getGitInfo from './get-git-info';
import chalk from 'chalk';
import * as dotenv from 'dotenv';

import {
  createNamespace,
  getNamespace,
  writeKV,
  deleteNamespace,
  getPreview,
  setBindings,
} from '../scripts/src/cf/kv';
import {
  command,
  getToml,
  readFile,
  writeFile,
  writeToml,
  formatBindingId,
} from '../scripts/src/util';
import { assertPassUnlocked, setSecretFile, setSecrets } from './secret';
import { assertDatabase } from './db';

let KV_DEBUG = false;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __appDir = path.join(__dirname, '..');
const __rootDir = path.join(__appDir, '..');
const __dataDir = `${__appDir}/data`;
const gitDataPath = `${__dataDir}/git.json`;
const ssrDir = `${__appDir}/ui/src/pages`;

type Env = {
  env: 'dev' | 'preview' | 'uat' | 'prod';
  envFile: string;
  debug: boolean;
};

export { KV_DEBUG, Env, __rootDir };

// function getArgs() {
//   let env = 'preview';
//   let cmdstring = 'all';
//   let debug = false;

//   const args = process.argv.filter(Boolean);
//   let state: string | null = null;
//   for (const arg of args) {
//     if (arg === '--debug') {
//       debug = true;
//       continue;
//     }
//     if (arg === '--env') {
//       state = 'ENV';
//       continue;
//     }
//     if (arg === '--cmds') {
//       state = 'CMDS';
//       continue;
//     }
//     if (state === 'ENV') {
//       env = arg;
//       state = null;
//     }
//     if (state === 'CMDS') {
//       cmdstring = arg;
//       state = null;
//     }
//   }

// if (!env) {
//   throw new Error("[build-worker] CLI argument --entry missing.");
// }
// if (!cmds) {
//   throw new Error("[build-worker] CLI argument --out missing.");
// }

//   return { env, cmdstring, debug };
// }

async function setGitconfig(bindingNameUI, appName, env, gitDataPath, tomlPath, debug) {
  const bindingId = formatBindingId(bindingNameUI, env, appName);

  console.log(
    chalk.green(
      `[wrangle] Getting from data path ${gitDataPath} and Setting git commit for binding Id ${bindingId}`
    )
  );
  const key = 'gitInfo';
  const commitStr = await getGitInfo();

  writeKV(bindingNameUI, env, appName, tomlPath, key, commitStr, debug);
  console.log(
    chalk.magenta(
      `[wrangle] Writing git commit to KV ID ${bindingId} in ${env.env} env -> path -> ${gitDataPath}`
    )
  );
  writeFile(gitDataPath, commitStr);
}

// async function setVars(_env: Env, envVars: Record<string, string>, ssrDir, tomlPath, secrets) {
//   const ssrDirs = fs
//     .readdirSync(ssrDir)
//     .map((dir) => path.join(ssrDir, dir).split('/').pop())
//     .join(',');

//   const config = getToml(tomlPath);
//   if (!config) {
//     throw new Error(`no config found at ${tomlPath}`);
//   }
//   console.log(chalk.green(`[wrangle] Setting vars for ${_env.env} -> ${tomlPath}`));

//   const env = _env.env;
//   Object.keys(secrets).forEach((key) => {
//     delete config[key];
//   });
//   const newVars = {
//     ...config['env'][`${env}`]['vars'],
//     ...envVars,
//     SSR_BASE_PATHS: ssrDirs,
//   };
//   Object.keys(secrets).forEach((key) => {
//     delete newVars[key];
//   });
//   console.log('[wrangle] newVars', newVars);
//   writeToml(
//     {
//       ...config,
//       env: {
//         ...config['env'],
//         [`${env}`]: {
//           ...config['env'][`${env}`],
//           vars: newVars,
//         },
//       },
//     },
//     tomlPath
//   );
// }

// function assertPathExists(filePaths) {
//   if (!Array.isArray(filePaths)) {
//     filePaths = [filePaths];
//   }
//   for (const filePath of filePaths) {
//     const [path, write] = filePath;
//     if (!fs.existsSync(path)) {
//       if (write) {
//         writeFile(path, '');
//         return;
//       }
//       throw new Error(`[wrangle] no file at ${path}`);
//     }
//   }
// }

async function assertTomlEnv(tomlPath, env) {
  const env_name = env.env;
  const config = getToml(tomlPath);
  if (!config) {
    throw new Error('no config');
  }
  if (!config['env']) {
    config['env'] = {};
  }
  if (!config['env'][`${env_name}`]) {
    config['env'][`${env_name}`] = {};
  }
  const envRegex = new RegExp(`\\.${env_name}\\.`);
  const baseToml = tomlPath.replace(envRegex, '.');
  const baseConfig = getToml(baseToml);
  if (!baseConfig) {
    throw new Error('no base config');
  }
  const baseKeys = [
    'name',
    'compatibility_date',
    'node_compat',
    'workers_dev',
    'main',
    'site',
    'dev',
  ];

  baseKeys.forEach((key) => {
    if (!config[key]) {
      console.log(chalk.magenta(`[wrangle] [toml] adding ${key}`));
      console.log(baseConfig[key]);
      config[key] = baseConfig[key];
    }
  });

  config.name = `ai-maps`;

  await writeToml(config, tomlPath);
}

async function setupAsserts(env, debug) {
  const tomlPath = `${__rootDir}/wrangler.${env.env}.toml`;
  const envFile = path.join(__appDir, env.envFile);
  const secretFilePath = `${__rootDir}/.dev.vars`;

  const envVars = dotenv.config({
    path: envFile,
  }).parsed;
  // const parsed = Object.entries(envVars).reduce((acc, [key, value]) => {
  //   acc[key] = value;
  //   return acc;
  // }, {});
  if (!envVars) {
    throw new Error(`[wrangle] No config found for ${env.envFile}`);
  }
  const appName = process.env.VITE_APP_NAME;
  if (!appName) {
    throw new Error('[wrangle] No app name found');
  }
  console.log(chalk.green(`[wrangle] START Setting up ${env.env} environment for ${appName}`));
  console.log(chalk.magenta(`[wrangle] envFile: ${envFile} -> vars->`));

  // const secretFilePath = `${__rootDir}/.${env.env}.vars`;
  if (process.env.VITE_APP_NAME === undefined) {
    throw new Error('[wrangle] No app name found');
  }
  await assertPathExists([
    [envFile, false],
    [__dataDir, false],
    [ssrDir, false],
    [tomlPath, true],
    [secretFilePath, true],
  ]);

  await assertTomlEnv(tomlPath, env);
  const secrets = {
    __SECRET__: `Cloud/auth0/${process.env.VITE_APP_NAME}/${env.env}/__SECRET__`,
    NEXTAUTH_SECRET: `Cloud/nextauth/${process.env.VITE_APP_NAME}/${env.env}/NEXTAUTH_SECRET`,
    GITHUB_CLIENT_ID: `Github/oauth/${process.env.VITE_APP_NAME}/${env.env}/GITHUB_CLIENT_ID`,
    GITHUB_CLIENT_SECRET: `Github/oauth/${process.env.VITE_APP_NAME}/${env.env}/GITHUB_CLIENT_SECRET`,
    EMAIL_SERVER_PASSWORD: `Mail/fastmail/ai-maps-nodemailer`,
    JMAP_TOKEN: `Mail/fastmail/ai-maps-email-send-token`,
  };

  const bindingNameBase = `${process.env.VITE_APP_NAME.toUpperCase().replace(/-/g, '_')}`;
  const bindingNameSuffixes = [
    'UI',
    // "SESSIONS", "USERS", "MAPS"
  ];
  const bindingNameDb = `${bindingNameBase}_DB_V1`;
  const bindingNameUI = `${bindingNameBase}_UI`;
  const bindingIdDb = formatBindingId(bindingNameDb, env, appName);

  if (debug || process.env.VITE_LOG_LEVEL === 'debug') {
    console.log(envVars);
    console.log(chalk.magenta('[wrangle] bindingNameBase', bindingNameBase));
    console.log(chalk.magenta('[wrangle] bindingNameDb', bindingNameDb));
    console.log(chalk.magenta('[wrangle] bindingIdDb', bindingIdDb));
  }
  return {
    appName,
    gitDataPath,
    tomlPath,
    secretFilePath,
    ssrDir,
    secrets,
    bindingNameBase,
    bindingNameUI,
    bindingNameSuffixes,
    bindingNameDb,
    envVars,
  };
}

async function main(env, debug, cmds = ['all']) {
  const {
    appName,
    gitDataPath,
    tomlPath,
    secretFilePath,
    ssrDir,
    secrets,
    bindingNameBase,
    bindingNameUI,
    bindingNameSuffixes,
    bindingNameDb,
    envVars,
  } = await setupAsserts(env, debug);
  while (cmds.length) {
    const cmd = cmds.shift();
    console.log(chalk.cyan(`[wrangle] executing cmd: ${cmd}`));
    switch (true) {
      case cmd === 'git':
        await setGitconfig(bindingNameUI, appName, env, gitDataPath, tomlPath, debug);
        break;
      case cmd === 'secrets':
        await setSecrets(secrets, secretFilePath, env, tomlPath, 32);
        break;
      case cmd === 'kv':
        await setBindings(bindingNameBase, bindingNameSuffixes, appName, env, tomlPath, debug);
        break;
      case cmd === 'vars':
        await setVars(env, envVars, ssrDir, tomlPath, secrets);
        break;
      case cmd?.includes('db'):
        const dbCommand = cmd?.split(':')[1];
        const subCommand = cmd?.split(':')[2];
        if (dbCommand) {
          await assertDatabase(bindingNameDb, appName, env, tomlPath, subCommand, dbCommand, debug);
          break;
        }
        await assertDatabase(bindingNameDb, appName, env, tomlPath, undefined, undefined, debug);
        break;
      case cmd === 'all':
        await setGitconfig(bindingNameUI, appName, env, gitDataPath, tomlPath, debug);
        await setSecrets(secrets, secretFilePath, env, tomlPath, 32);
        await setBindings(bindingNameBase, bindingNameSuffixes, appName, env, tomlPath, debug);
        await assertDatabase(bindingNameDb, appName, env, tomlPath, debug);
        await setVars(env, envVars, ssrDir, tomlPath, secrets);
        break;
      default:
        break;
    }
  }
}

(async () => {
  //TODO change to mode
  const { env, cmdstring, debug } = getArgs();
  const cmds = cmdstring.split(',');
  console.log(chalk.green(`[wrangle] [cmds] ${cmds}`));

  const envFile =
    env === 'prod'
      ? '.env.prod'
      : // : env === "preview"
        // ? ".env.preview"
        env === 'uat'
        ? '.env.uat'
        : '.env.preview';

  const _env = {
    debug,
    env,
    envFile,
  };

  await main(_env, debug, cmds);
})();
