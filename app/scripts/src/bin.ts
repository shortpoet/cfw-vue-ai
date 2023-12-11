import sade from 'sade';
import * as kv from './commands/kv';
import * as vars from './commands/vars';
import * as git from './commands/git';
import * as db from './commands/db';
import * as secret from './commands/secret';
import build from './commands/build';
import go from './commands/go';

const cli = sade('cfw')
  .version('0.0.1')
  // .version('$$VERSION$$') // Note: Inject via build step
  .option('-C, --cwd', 'The relative working directory', '.')
  .option('-g, --goLive', 'Go live', false)
  .option('-e, --env', 'The environment to list', 'dev')
  // .option('-d, --debug', 'Debug mode', false)

  .command('kv list')
  .alias('kv ls')
  .describe('List all KV namespaces')
  .action(kv.list)

  .command('kv create')
  .describe('Create KV namespaces')
  .action(kv.create)

  .command('kv delete')
  .describe('Delete KV namespaces')
  // .option('-C, --cwd', 'The relative working directory', '.')
  // .option('-e, --env', 'The environment to list', 'dev')
  // .option('-d, --debug', 'Debug mode', false)
  .option('-b, --bindingName', 'The binding name')
  .action(kv.deleteKV)

  .command('vars set')
  .describe('Set KV vars')
  .action(vars.set)

  .command('secret set')
  .describe('Set KV secrets')
  .action(secret.set)

  .command('git set')
  .describe('Set git config')
  .action(git.set)

  .command('db list')
  .alias('db ls')
  .describe('List all D1 databases')
  .action(db.list)

  .command('db create')
  .describe('Create D1 databases')
  .action(db.create)

  .command('db apply')
  .describe('Apply D1 database migrations')
  .action(db.apply)

  .command('db delete')
  .describe('Delete D1 databases')
  .action(db.deleteDb)

  .command('build')
  .describe('Compile the Worker(s) within a directory.')
  .option('-C, --cwd', 'The relative working directory', '.')
  .option('-e, --env', 'The environment to list', 'dev')
  // .option('-d, --dir', 'The directory containing Worker scripts', 'api')
  .option('-o, --only', 'The list of Worker names to build; overrides `--ignore` list!')
  .option('-i, --ignore', 'The list of Worker names to skip')
  .option('-s, --single', 'The target is a single Worker')
  .action(build)

  .command('go')
  .describe('Go live')
  .option('-C, --cwd', 'The relative working directory', '.')
  .option('-e, --env', 'The environment to list', 'dev')
  .action(go);

cli.parse(process.argv, {
  boolean: ['debug', 'single', 'quiet', 'goLive'],
  string: ['env', 'dir', 'output', 'only', 'ignore', 'profile', 'migration', 'bindingName'],
});
