import { KVNamespace } from '@cloudflare/workers-types';
import { execSync } from 'node:child_process';
import getGitInfo from './get-git-info';
import { deepClone } from './util';

import * as dotenv from 'dotenv';
let KV_DEBUG = false;

export {
  createNamespace,
  writeKV,
  getNamespace,
  deleteNamespace,
  getPreview,
  assertBinding,
  setBindings,
  getNamespaces,
};
import { Env, KV_DEBUG as debug } from './wrangle';
import { getToml, writeToml, executeWranglerCommand, formatBindingId } from './util';
import chalk from 'chalk';

const getBinding = (env, tomlPath) => {
  const config = getToml(tomlPath);
  if (!config) {
    throw new Error('no config');
  }
  return config['env'][`${env}`]['kv_namespaces'][0]['binding'];
};

async function assertBinding(bindingName, env, appName, tomlPath) {
  console.log(chalk.green(`[wrangle] [kv] Asserting kv bindings for ${bindingName} in env ${env}`));
  const bindingId = formatBindingId(bindingName, env, appName);
  if (!getNamespace(bindingId, env)) {
    createNamespace(bindingName, env, appName, tomlPath);
  }
  writeNamespaceToToml(bindingName, tomlPath, env);
}

async function setBindings(bindingNameBase, bindingNameSuffixes, appName, env, tomlPath, debug) {
  for (const suffix of bindingNameSuffixes) {
    const bindingName = `${bindingNameBase}_${suffix}`;
    if (debug || process.env.VITE_LOG_LEVEL === 'debug') {
      console.log(chalk.cyan('[wrangle] [kv]  bindingName', bindingName));
      KV_DEBUG = true;
    }
    assertBinding(bindingName, env, appName, tomlPath);
  }
}

function getNamespaces(env: Env) {
  return JSON.parse(executeWranglerCommand('kv:namespace list', env.env));
}

function getNamespace(id: string, env: Env) {
  const n = getNamespaces(env);
  // console.log(n);
  // console.log(`[wrangle] [kv] getN - id: ${id}`);
  return n.find((i) => i.title === id);
}

function getPreview(id: string, env: Env) {
  return getNamespaces(env).find((i) => i.title === `${id}_preview`);
}

function deleteNamespace(env: Env, namespaceId: string, previewId: string) {
  let deleteCmd = `kv:namespace delete --namespace-id ${namespaceId}`;
  // if (debug) process.exit(0);
  let deleteRes = executeWranglerCommand(deleteCmd, env.env);
  chalk.cyan(console.log(deleteRes));
  deleteCmd = `kv:namespace delete --namespace-id ${previewId}`;
  deleteRes = executeWranglerCommand(deleteCmd, env.env);
  chalk.cyan(console.log(deleteRes));
}

function writeNamespaceToToml(
  bindingName: string,
  tomlPath: string,
  env: Env,
  debug: boolean = false
) {
  const env_name = env.env;
  //@ts-expect-error
  const id = formatBindingId(bindingName, env, process.env.VITE_APP_NAME);
  const namespaceId = getNamespace(id, env).id;
  const previewId = getPreview(id, env).id;
  console.log(
    chalk.green(
      `[wrangle] [kv] Writing binding ${bindingName} to toml ${tomlPath}
      [wrangle] [kv] namespaceId: ${namespaceId}
      [wrangle] [kv] previewId: ${previewId}`
    )
  );
  // updateToml(`env.${env}.kv_namespaces.0.title`, id);
  const config = getToml(tomlPath);
  if (!config) {
    throw new Error('no config');
  }
  console.log(chalk.magenta(`[wrangle] [kv] config before:`));
  // const clone = deepClone(config);
  // console.log(clone);
  // if (debug || process.env.VITE_LOG_LEVEL === "debug") {
  //   console.log(config);
  // }
  let kv_namespaces: any[] = config['env'][`${env_name}`]['kv_namespaces'];
  if (!kv_namespaces) {
    kv_namespaces = [];
  }
  const kv_namespace = kv_namespaces.find((i) => i.binding === bindingName);
  if (kv_namespace && kv_namespace.id === namespaceId && kv_namespace.preview_id === previewId) {
    console.log(
      chalk.yellow(`[wrangle] [kv] binding ${bindingName} already exists in toml ${tomlPath}`)
    );
    return;
  }
  kv_namespaces = kv_namespaces.concat({
    binding: bindingName,
    id: namespaceId,
    preview_id: previewId,
  });
  config['env'][`${env_name}`]['kv_namespaces'] = kv_namespaces;
  writeToml(config, tomlPath);
}

function createNamespace(
  bindingName: string,
  env: Env,
  appName: string,
  tomlPath: string,
  debug: boolean = false
) {
  const cmd = `kv:namespace create ${bindingName}`;
  const cmdPrev = `kv:namespace create ${bindingName} --preview`;
  // if (debug) process.exit(0);
  const res = executeWranglerCommand(cmd, env.env);
  chalk.cyan(console.log(res));
  const resPrev = executeWranglerCommand(cmdPrev, env.env);
  chalk.cyan(console.log(resPrev));
}

function updateToml(nestedKey: string, value: string, tomlPath: string) {
  const config = getToml(tomlPath);
  if (!config) {
    throw new Error('no config');
  }
  const keys = nestedKey.split('.');
  let current = config;
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  writeToml(config, tomlPath);
}

function writeKV(bindingName, env, appName, tomlPath, key, value, debug) {
  assertBinding(bindingName, env, appName, tomlPath);
  const bindingId = formatBindingId(bindingName, env, appName);
  const namespaceId = getNamespace(bindingId, env).id;

  const cmd = `kv:key put --namespace-id=${namespaceId} '${key}' '${value}'`;
  if (debug) {
    console.log(
      chalk.magenta(
        `[wrangle] [kv] bindingId: ${bindingId}
         [wrangle] [kv] { "${key}": "${value}" }`
      )
    );
  }
  const res = executeWranglerCommand(cmd, env.env);
  console.log(res);
}
