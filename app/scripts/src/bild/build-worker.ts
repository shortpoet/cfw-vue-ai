import esbuild, { Format, Platform } from 'esbuild';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { fileURLToPath } from 'node:url';

function buildWorker({
  entry,
  out,
  debug,
  external,
}: {
  entry: string;
  out: string;
  debug: boolean;
  external: string[];
}) {
  const plugins = [NodeModulesPolyfillPlugin()];
  const define = {
    plugins,
    platform: 'browser' as Platform,
    conditions: ['worker', 'browser'],
    entryPoints: [entry],
    sourcemap: true,
    outfile: out,
    external,
    logLevel: 'warning' as esbuild.LogLevel,
    format: 'esm' as Format,
    target: 'esnext',
    minify: !debug,
    bundle: true,
    // banner: {
    //   js: "const __filename = (await import('node:url')).fileURLToPath(import.meta.url);const __dirname = (await import('node:path')).dirname(__filename);",
    //   js: "const require = (await import('node:module')).createRequire(import.meta.url);const __filename = (await import('node:url')).fileURLToPath(import.meta.url);const __dirname = (await import('node:path')).dirname(__filename);",
    // },
    define: {
      IS_CLOUDFLARE_WORKER: 'true',
    },
  };
  console.log('define', define);
  return esbuild.build(define);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build(getArgs());
}

export async function build({ entry, out, debug }: { entry: string; out: string; debug: boolean }) {
  const external = [
    // "@vueuse/core",
    // "vue-demi",
    // "node:fs",
    // "node:util",
    // "node:stream",
    // "node:buffer",
    // "node:http",
    // 'node:url',
    '__STATIC_CONTENT_MANIFEST',
  ];

  console.log('[build-worker] Building worker...');
  // const args = getArgs();
  const config = {
    entry,
    out,
    debug,
    external,
  };
  try {
    await buildWorker(config);
    console.log('[build-worker] Worker built successfully.');
  } catch (err) {
    console.error('[build-worker] Failed to build worker.', err);
  }
}

function getArgs() {
  let entry;
  let out;
  let debug = false;

  const args = process.argv.filter(Boolean);
  let state = null;
  for (const arg of args) {
    if (arg === '--debug') {
      debug = true;
      continue;
    }
    if (arg === '--entry') {
      state = 'ENTRY';
      continue;
    }
    if (arg === '--out') {
      state = 'OUT';
      continue;
    }
    if (state === 'ENTRY') {
      entry = arg;
      state = null;
    }
    if (state === 'OUT') {
      out = arg;
      state = null;
    }
  }

  if (!entry) {
    throw new Error('[build-worker] CLI argument --entry missing.');
  }
  if (!out) {
    throw new Error('[build-worker] CLI argument --out missing.');
  }

  return { entry, out, debug };
}
