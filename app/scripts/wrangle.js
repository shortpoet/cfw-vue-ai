#!/usr/bin/env node
import sade from 'sade';
import colors from 'kleur';
import 'toml';
import 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import chalk from 'chalk';

const ARROW = '   ~> ';
const SPACER = ' '.repeat(6);
const CFW = colors.bold('[WRANGLE]');
function print(color, msg) {
  console.log(
    colors[color](CFW),
    msg.includes('\n') ? msg.replace(/(\r?\n)/g, '$1' + SPACER) : msg
  );
}
const info = (msg) => print('white', msg);
const success = (msg) => print('green', msg);
colors.dim().bold;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __appDir = path.join(__dirname, '..');
path.join(__appDir, '..');
const __wranglerDir = path.join(__appDir, 'api');
function executeWranglerCommand(command, env, wranglerFile) {
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

function getNamespaces(env) {
  return JSON.parse(executeWranglerCommand('kv:namespace list', env.env));
}

async function list(opts) {
  const env = opts?.env || 'dev';
  const debug = opts?.debug || false;
  const envFile =
    env === 'prod'
      ? '.env.prod'
      : // : env === "preview"
        // ? ".env.preview"
        env === 'uat'
        ? '.env.uat'
        : '.env.preview';
  const wranglerFile =
    env === 'prod'
      ? 'wrangler.prod.toml'
      : env === 'preview'
        ? 'wrangler.preview.toml'
        : env === 'uat'
          ? 'wrangler.uat.toml'
          : 'wrangler.toml';
  info('Retrieving KV namespaces:');
  const items = await getNamespaces({ env, envFile, debug, wranglerFile });
  const GAP = '    ',
    TH = colors.dim().bold().italic;
  success(TH('ID') + ' '.repeat(30) + GAP + TH('Title'));
  let i = 0,
    arr = items,
    tmp = ''; // ID => 32 chars
  for (; i < arr.length; i++) {
    if (tmp) tmp += '\n';
    tmp += (arr[i].supports_url_encoding ? colors.cyan : colors.red)(ARROW);
    tmp += arr[i].id + GAP + arr[i].title;
  }
  console.log(tmp);
}

sade('wrangle')
  .version('0.0.2') // Note: Inject via build step
  .option('-C, --cwd', 'The relative working directory', '.')
  .command('test [dir] [output]')
  .describe('Test the utility')
  .option('-e, --env', 'The environment to test', 'dev')
  .option('-d, --debug', 'Debug mode', false)
  .action(list)
  .parse(process.argv, {
    boolean: ['single', 'quiet'],
    string: ['only', 'ignore', 'profile'],
  });
