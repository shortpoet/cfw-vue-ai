import sade from 'sade';
import * as kv from './commands/kv';

const cli = sade('cfw')
  .version('0.0.1')
  // .version('$$VERSION$$') // Note: Inject via build step
  .option('-C, --cwd', 'The relative working directory', '.')
  .option('-e, --env', 'The environment to list', 'dev')
  .option('-d, --debug', 'Debug mode', false)

  .command('kv list')
  .alias('kv ls')
  .describe('List all KV namespaces')
  .action(kv.list);

cli.parse(process.argv, {
  boolean: ['debug', 'single', 'quiet'],
  string: ['env', 'dir', 'output', 'only', 'ignore', 'profile'],
});
