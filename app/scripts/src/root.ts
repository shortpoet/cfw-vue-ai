import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export { __filename, __dirname, __appDir, __rootDir, __wranglerDir };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __appDir = join(__dirname, '..');
const __rootDir = join(__appDir, '..');
const __wranglerDir = join(__appDir, 'api');
