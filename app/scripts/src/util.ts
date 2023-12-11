import { homedir } from 'os';
import { promises as fs } from 'fs';
import { createRequire } from 'module';
import { existsSync as exists } from 'fs';
import path, { dirname, parse, join, resolve } from 'path';
import { error } from './log';
import toml from 'toml';
import json2toml from 'json2toml';
// import fs from 'node:fs';
import { exec, execSync, spawn } from 'node:child_process';
import colors from 'kleur';
import { Arrayable, Config, WrangleConfig, WranglerToml } from './types';
import * as log from './log';

// @ts-ignore - Node 14.14
export const rmdir = fs.rm || fs.rmdir;
export const write = fs.writeFile;
export const read = fs.readFile;
export const ls = fs.readdir;

export {
  getToml,
  writeToml,
  command,
  writeFile,
  readFile,
  executeWranglerCommand,
  formatBindingId,
};

export { exists };

export function assert(input: unknown, msg: string, isFile?: boolean, exitCode = 2): void | false {
  // console.log(colors.magenta(`[wrangle] [util] asserting ${input}`));
  // console.log(exists(input as string));
  // (isFile && exists(input as string)) || !!input || error(msg, 0);
  (isFile && exists(input as string) && !!input) || (!isFile && !!input) || error(msg, exitCode);
}

export function group(str: Arrayable<string>): Set<string> {
  return new Set(Array.isArray(str) ? str : str.split(','));
}

export const require = createRequire(import.meta.url);

export async function load<T = unknown>(str: string, dir = '.'): Promise<T | false> {
  if (!exists((str = resolve(dir, str)))) return false;
  try {
    var m = require(str);
  } catch {
    m = await import(str).catch(() => false);
  } finally {
    return m || error(`Error loading "${str}" file`);
  }
}

const formatBindingId = (
  opts: Pick<Config, 'appName' | 'env' | 'bindingNameUI' | 'bindingNameDb'>,
  isUI: boolean
) => {
  return isUI
    ? `${opts.appName}-${opts.env}-${opts.bindingNameUI}`
    : `${opts.appName}-${opts.env}-${opts.bindingNameDb}`;
};

function executeWranglerCommand(
  command: string,
  opts: Pick<Config, 'env' | 'wranglerFile' | 'goLive'>
) {
  command = `--env ${opts.env} ${command} --config ${opts.wranglerFile}`;
  console.log(colors.magenta(`\n========\n[wrangle] [kv] executing wrangler command:`));
  console.log(colors.green(`\nnpx wrangler ${command}`));
  console.log(colors.magenta(`========\n`));
  if (!opts.goLive) {
    console.log(colors.yellow(`[wrangle] [kv] goLive is false, skipping wrangler command`));
    return '{}';
  }
  const execution = execSync(`npx wrangler ${command}`, {
    encoding: 'utf8',
    shell: '/bin/bash',
  });
  return execution;
}

function command(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

async function getToml(tomlPath: string): Promise<WranglerToml> {
  return JSON.parse(await read(tomlPath, 'utf8'));
  return toml.parse(await read(tomlPath, 'utf8'));
}

const writeToml = async (
  data: any,
  conf: Pick<Config, 'wranglerFile' | 'debug' | 'env' | 'appName'>
) => {
  const { wranglerFile, debug, env, appName } = conf;
  if (debug) log.print('blue', `[util] writing toml file: "${wranglerFile}"`);
  if (debug) console.log(data);
  const backupPath = wranglerFile.replace(`${env}.toml`, `${env}.bak.toml`);
  if (debug) log.print('blue', `[util] backing up toml file: "${backupPath}"`);
  // await writeFile(backupPath, await readFile(wranglerFile));
  await writeFile(`${wranglerFile}`, JSON.stringify(data, null, 2));
  const toml = json2toml(data);
  console.log(toml);
  let lines = toml.split('\n');
  // console.log(lines);
  // const ENV_LINE = `[env.${env}]`;
  // const NAME_LINE = `name = "${appName}"`;
  // if (lines.indexOf(ENV_LINE) === -1) lines.push(ENV_LINE);
  // const nextLine = lines.indexOf(ENV_LINE) + 1;
  // if (nextLine && nextLine !== NAME_LINE) lines.splice(nextLine, 0, NAME_LINE);
  const tomlString = lines.join('\n');
  // await writeFile(wranglerFile, tomlString);
};

const writeFile = async (file: string, data: string) => {
  try {
    // console.log(colors.magenta(`[wrangle] [util] writing ${file}`));
    await write(file, data);
  } catch (error) {
    console.error(error);
  }
};

const readFile = async (file: string) => {
  try {
    if (await read(file)) {
      return await read(file, 'utf8');
    } else {
      return '';
    }
  } catch (error) {
    console.error(error);
    return '';
  }
};
