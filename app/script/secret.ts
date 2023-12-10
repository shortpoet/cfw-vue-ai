import crypto from 'crypto';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Env } from './wrangle';
import { command, readFile, writeFile } from '../scripts/src/util';
import chalk from 'chalk';

export { writeSecretToKv, setSecretFile, setSecrets, assertPassUnlocked };

async function assertPassUnlocked() {
  chalk.yellow(`[wrangle] [secret] checking pass is unlocked\n`);
  let res = false;
  try {
    res = (await command('pass test/unlocked')).trim() === 'true' ? true : false;
  } catch (error) {
    console.log(chalk.red(`[wrangle] [secret] error: pass is locked. Please unlock pass first.`));
  }
  return res;
}

async function setSecrets(secrets, secretsFilePath, env, tomlPath, generateLength = 32) {
  const res = await assertPassUnlocked();
  if (res === false) {
    process.exit(1);
  }
  console.log(chalk.green(`[wrangle] [secret] Pass is unlocked`));
  console.log(chalk.magenta(`[wrangle] [secret] Setting secrets for ${env.env}`));

  for (const [secretName, passPath] of Object.entries(secrets)) {
    const secret = await getOrCreateSecret(secretName, passPath, generateLength);
    if (env.debug) {
      console.log(chalk.cyan(`[wrangle] [secret] secret ${secretName}: ${secret}\n`));
    }
    await writeSecretToKv(secretName, secret, env, tomlPath);
    await setSecretFile(secretName, secret, env, secretsFilePath);
  }

  return secrets;
}

async function getOrCreateSecret(secretName, passKey, generateLength = 32) {
  let secret;
  console.log(chalk.magenta(`[wrangle] [secret] getOrCreateSecret ${secretName} ${passKey}`));
  secret = await passGet(passKey);
  if (!secret) {
    chalk.yellow(`[wrangle] [secret] secret ${secretName} not found. Generating new secret`);
    secret = generateSecret(generateLength);
    await passWrite(passKey, secret);
  }
  return secret;
}

async function setSecretFile(secretName: string, secretValue: string, env: Env, filePath: string) {
  const existingSecrets = await readFile(filePath);
  const lines = existingSecrets.split('\n').filter((line) => line.trim() !== '');
  const keyValuePairs = lines.map((line) => {
    const [key, value] = line.trim().split('=');
    return { key, value };
  });
  const existingPair = keyValuePairs.find((pair) => pair.key === secretName);
  existingPair
    ? (existingPair.value = secretValue)
    : keyValuePairs.push({ key: secretName, value: secretValue });
  const newLines = keyValuePairs.map(({ key, value }) => `${key}=${value}`);
  await writeFile(filePath, newLines.join('\n'));
}

async function writeSecretToKv(key: string, value: string, _env: Env, tomlPath: string) {
  const env = _env.env;
  console.log(chalk.magenta(`[wrangle] [secret] writing ${key} to ${env}\n`));
  const cmd = `echo "${value}" | npx wrangler --env ${env} --config ${tomlPath} secret put ${key}`;
  if (_env.debug) {
    console.log(chalk.magenta(`[wrangle] [secret] writeSecretToKv.cmd ${cmd}\n`));
  }
  const res = await command(cmd);
  console.log(chalk.cyan(res + '\n'));
}

function generateSecret(length: number) {
  return crypto.randomBytes(length / 2).toString('hex');
}

async function passGet(path: string): Promise<string | null> {
  try {
    return (await command(`pass ${path}`)).trim();
  } catch (error) {
    return null;
  }
}

async function passWrite(path: string, value: string) {
  return await command(`pass insert -m ${path} << EOF
${value}
EOF`);
}
