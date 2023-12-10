import toml from 'toml';
import json2toml from 'json2toml';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec, execSync, spawn } from 'node:child_process';
import chalk from 'chalk';
import { Env, __rootDir } from './wrangle';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export {
  getToml,
  writeToml,
  command,
  writeFile,
  readFile,
  deepClone,
  executeWranglerCommand,
  formatBindingId
};

const formatBindingId = (binding: string, env: Env, appName: string) =>
  `${appName}-preview-${env.env}-${binding}`;

function executeWranglerCommandSpawn(command: string, env: Env['env']) {
  (async () => {
    const wrangler = spawn('npx', ['wrangler', '--env', env, ...command.split(' ')], {
      stdio: 'inherit'
    });
    wrangler.stdout?.on('data', (data) => {
      console.log(chalk.magenta(`[wrangle] [kv] ${data}`));
    });
    wrangler.stderr?.on('data', (data) => {
      console.error(chalk.red(`[wrangle] [kv] ${data}`));
    });
    wrangler.on('close', (code) => {
      console.log(chalk.magenta(`[wrangle] [kv] child process exited with code ${code}`));
    });
  })();
}
function utoa(data) {
  return btoa(unescape(encodeURIComponent(data)));
}
function atou(b64) {
  return decodeURIComponent(escape(atob(b64)));
}
function executeWranglerCommand(command: string, env?: Env['env']) {
  command = `--env ${env} ${command} --config ${__rootDir}/wrangler.${env}.toml`;
  // command = command.replace(/&/g, "^&");
  // const dangerBase64 = utoa(command);
  // const execution = execSync(
  //   `echo "$(echo -e ${dangerBase64} | base64 -d)" | npx`,
  //   {
  //     encoding: "utf8",
  //     shell: "/bin/bash",
  //   }
  // );
  console.log(
    chalk.magenta(
      `\n========\n[wrangle] [kv] executing wrangler command: \nnpx wrangler ${command}`
    )
  );
  const execution = execSync(`npx wrangler ${command}`, {
    encoding: 'utf8',
    shell: '/bin/bash'
  });
  console.log(chalk.magenta(`========\n`));
  return execution;
}

function command(cmd): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

function getToml(tomlPath): Record<string, any> | undefined {
  try {
    return toml.parse(fs.readFileSync(tomlPath, 'utf8'));
  } catch (error) {
    console.error(error);
  }
}

const writeToml = (data: any, tomlPath) => {
  const backupPath = tomlPath.replace('wrangler.toml', 'wrangler.bak.toml');
  try {
    fs.writeFileSync(backupPath, fs.readFileSync(tomlPath, 'utf8'));
    fs.writeFileSync(tomlPath, json2toml(data));
  } catch (error) {
    console.error(error);
  }
};

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

function deepClone<T>(source: T): T {
  source = JSON.parse(JSON.stringify(source));
  // if (source === null || typeof source !== "object") {
  //   return source;
  // }

  // if (Array.isArray(source)) {
  //   const newArray = [] as any[];
  //   for (const item of source) {
  //     newArray.push(deepClone(item));
  //   }
  //   return newArray as T;
  // }

  // if (typeof source === "object") {
  //   const newObj = {} as any;
  //   for (const key in source) {
  //     if (source.hasOwnProperty(key)) {
  //       newObj[key] = deepClone(source[key]);
  //     }
  //   }
  //   return newObj as T;
  // }

  return source;
}
