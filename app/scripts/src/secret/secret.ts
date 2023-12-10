import crypto from 'crypto';
import colors from 'kleur';
import { command, writeFile, readFile, assert } from '../util';
import { Config } from '../types';
import { __rootDir } from '@/types/src/root';

export { writeSecretToKv, setSecretFile, setSecrets, assertPassUnlocked };

async function assertPassUnlocked() {
  console.log(colors.yellow(`[wrangle] [secret] checking pass is unlocked\n`));
  let res = false;
  try {
    res = (await command('pass test/unlocked')).trim() === 'true' ? true : false;
  } catch (error) {
    console.log(colors.red(`[wrangle] [secret] error: pass is locked. Please unlock pass first.`));
  }
  return res;
}

async function setSecrets(
  secrets: Record<string, string>,
  secretsFilePath: string,
  opts: Pick<Config, 'env' | 'debug' | 'wranglerFile'>,
  generateLength = 32
) {
  const res = await assertPassUnlocked();
  if (res === false) {
    process.exit(1);
  }

  const hasSecretFile = assert(secretsFilePath, `[wrangle] [config] No secret file`, true, 0);
  if (!hasSecretFile) {
    console.log(colors.yellow(`[wrangle] [secret] No secret file found. Creating new file`));
    writeFile(secretsFilePath, '');
  }

  console.log(colors.green(`[wrangle] [secret] Pass is unlocked`));
  console.log(colors.magenta(`[wrangle] [secret] Setting secrets for ${opts.env}`));

  for (const [secretName, passPath] of Object.entries(secrets)) {
    const secret = await getOrCreateSecret(secretName, passPath, generateLength);
    if (opts.debug) {
      console.log(colors.cyan(`[wrangle] [secret] secret ${secretName}: ${secret}\n`));
    }
    await writeSecretToKv(secretName, secret, opts);
    await setSecretFile(secretName, secret, secretsFilePath);
  }

  return secrets;
}

async function getOrCreateSecret(secretName: string, passKey: string, generateLength = 32) {
  let secret;
  console.log(colors.magenta(`[wrangle] [secret] getOrCreateSecret ${secretName} ${passKey}`));
  secret = await passGet(passKey);
  if (!secret) {
    colors.yellow(`[wrangle] [secret] secret ${secretName} not found. Generating new secret`);
    secret = generateSecret(generateLength);
    await passWrite(passKey, secret);
  }
  return secret;
}

async function setSecretFile(secretName: string, secretValue: string, secretsFilePath: string) {
  const existingSecrets = await readFile(secretsFilePath);
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
  await writeFile(secretsFilePath, newLines.join('\n'));
}

async function writeSecretToKv(
  key: string,
  value: string,
  opts: Pick<Config, 'env' | 'debug' | 'wranglerFile'>
) {
  console.log(colors.magenta(`[wrangle] [secret] writing ${key} to ${opts.env}\n`));
  const cmd = `echo "${value}" | npx wrangler --env ${opts.env} --config ${opts.wranglerFile} secret put ${key}`;
  if (opts.debug) {
    console.log(colors.magenta(`[wrangle] [secret] writeSecretToKv.cmd ${cmd}\n`));
  }
  const res = await command(cmd);
  console.log(colors.cyan(res + '\n'));
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
