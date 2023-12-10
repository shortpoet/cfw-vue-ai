// const require = (await import('node:module')).createRequire(import.meta.url);
const __filename = (await import('node:url')).fileURLToPath(import.meta.url);
const __dirname = (await import('node:path')).dirname(__filename);
import { dirname, join } from 'node:path';

export { __rootDir, __appDir, __wranglerDir };

console.log('__filename');
console.log(__filename);
const __appDir = join(__dirname, '../..');
console.log('__appDir');
console.log(__appDir);
const __rootDir = join(__appDir, '..');
const __wranglerDir = join(__appDir, 'api');
