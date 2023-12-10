#!/usr/bin/env node
import sade from 'sade';
import * as test from './commands/test';

sade('wrangle')
  .version('$$VERSION$$') // Note: Inject via build step
  .option('-C, --cwd', 'The relative working directory', '.')

  .command('test [dir] [output]')
  .describe('Test the utility')
  .option('-e, --env', 'The environment to test', 'dev')
  .option('-d, --debug', 'Debug mode', false)

  .parse(process.argv, {
    boolean: ['single', 'quiet'],
    string: ['only', 'ignore', 'profile'],
  });
