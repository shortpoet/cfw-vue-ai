import toml from 'toml';
// import json2toml from 'json2toml';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec, execSync, spawn } from 'node:child_process';
import chalk from 'chalk';
import { WrangleConfig } from './types';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __appDir = path.join(__dirname, '..');
const __rootDir = path.join(__appDir, '..');
const __wranglerDir = path.join(__appDir, 'api');

export {
  getToml,
  // writeToml,
  command,
  writeFile,
  readFile,
  executeWranglerCommand,
  formatBindingId,
};

const formatBindingId = (binding: string, env: WrangleConfig, appName: string) =>
  `${appName}-preview-${env.env}-${binding}`;

function executeWranglerCommand(
  command: string,
  env: WrangleConfig['env'],
  wranglerFile: WrangleConfig['wranglerFile']
) {
  command = `--env ${env} ${command} --config ${__wranglerDir}/${wranglerFile}`;
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

function getToml(tomlPath: string): Record<string, any> | undefined {
  try {
    return toml.parse(fs.readFileSync(tomlPath, 'utf8'));
  } catch (error) {
    console.error(error);
  }
}

// const writeToml = (data: any, tomlPath: string) => {
//   const backupPath = tomlPath.replace('wrangler.toml', 'wrangler.bak.toml');
//   try {
//     fs.writeFileSync(backupPath, fs.readFileSync(tomlPath, 'utf8'));
//     fs.writeFileSync(tomlPath, json2toml(data));
//   } catch (error) {
//     console.error(error);
//   }
// };

const writeFile = async (file: string, data: string) => {
  try {
    console.log(chalk.magenta(`[wrangle] [util] writing ${file}`));
    await fs.promises.writeFile(file, data);
  } catch (error) {
    console.error(error);
  }
};

const readFile = async (file: string) => {
  try {
    if (fs.existsSync(file)) {
      return await fs.promises.readFile(file, 'utf8');
    } else {
      return '';
    }
  } catch (error) {
    console.error(error);
    return '';
  }
};
