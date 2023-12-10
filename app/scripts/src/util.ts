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
import chalk from 'chalk';
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
  // console.log(chalk.magenta(`[wrangle] [util] asserting ${input}`));
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

const formatBindingId = (opts: Partial<Config>, isUi: boolean) =>
  isUi
    ? `${opts.appName}-ui-${opts.env}-${opts.bindingNameUI}`
    : `${opts.appName}-preview-${opts.env}-${opts.bindingNameDb}`;

function executeWranglerCommand(command: string, opts: Config) {
  command = `--env ${opts.env} ${command} --config ${opts.wranglerFile}`;
  console.log(
    chalk.magenta(
      `\n========\n[wrangle] [kv] executing wrangler command: \nnpx wrangler ${command}`
    )
  );
  const execution = execSync(`npx wrangler ${command}`, {
    encoding: 'utf8',
    shell: '/bin/bash',
  });
  console.log(chalk.magenta(`========\n`));
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
  return toml.parse(await read(tomlPath, 'utf8'));
}

const writeToml = async (data: any, conf: Pick<Config, 'wranglerFile' | 'debug'>) => {
  const { wranglerFile, debug } = conf;
  log.print('blue', `[util] writing toml file: "${wranglerFile}"`);
  if (debug) console.log(data);
  const backupPath = wranglerFile.replace('wrangler.toml', 'wrangler.bak.toml');
  log.print('blue', `[util] backing up toml file: "${backupPath}"`);
  await writeFile(backupPath, await readFile(wranglerFile));
  await writeFile(wranglerFile, json2toml(data));
};

const writeFile = async (file: string, data: string) => {
  try {
    console.log(chalk.magenta(`[wrangle] [util] writing ${file}`));
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
