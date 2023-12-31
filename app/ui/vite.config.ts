import vue from '@vitejs/plugin-vue';
import vike from 'vike/plugin';
import Unocss from 'unocss/vite';
import Markdown from 'unplugin-vue-markdown/vite';
import Shiki from 'markdown-it-shikiji';
import LinkAttributes from 'markdown-it-link-attributes';

import path from 'node:path';
import { defineConfig, loadEnv, UserConfig } from 'vite';
import { InlineConfig } from 'vitest';
import { fileURLToPath } from 'node:url';
// import { nodePolyfills } from "vite-plugin-node-polyfills";
import dotenv from 'dotenv';
const envDir = path.resolve(process.cwd(), '..');
const conf = dotenv.config({ path: `${envDir}` });
const parsed = conf.parsed;
const secretConf = dotenv.config({ path: `${envDir}/.env.secret` });
const parsedSecret = secretConf.parsed;
console.log(parsedSecret);

interface VitestConfigExport extends UserConfig {
  test: InlineConfig;
}
const vitestConfig: InlineConfig = {
  include: ['test/**/*.test.ts'],
  environment: 'jsdom',
  deps: {
    inline: ['@vue', '@vueuse', 'vue-demi'],
  },
};

export default ({ mode }: { mode: string }) => {
  console.log(`vite loading... (${mode})`);
  const loaded = loadEnv(mode, envDir, '');
  const env = { ...process.env, ...loaded, ...parsedSecret };
  const processEnvValues = {
    'process.env': Object.entries(env).reduce((prev, [key, val]) => {
      return {
        ...prev,
        [key]: val,
      };
    }, {}),
    __VUE_OPTIONS_API__: JSON.stringify(true),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
  };
  return defineConfig({
    envDir,
    define: processEnvValues,
    plugins: [
      vue({
        include: [/\.vue$/, /\.md$/],
      }),
      vike(),
      Unocss(),
      Markdown({
        wrapperClasses: 'prose prose-sm m-auto text-left',
        headEnabled: true,
        async markdownItSetup(md: any) {
          md.use(LinkAttributes, {
            matcher: (link: string) => /^https?:\/\//.test(link),
            attrs: {
              target: '_blank',
              rel: 'noopener',
            },
          });
          md.use(
            await Shiki({
              defaultColor: false,
              themes: {
                light: 'vitesse-light',
                dark: 'vitesse-dark',
              },
            })
          );
        },
      }),
    ],

    server: {
      port: parseInt(env.VITE_PORT || '3000'),
      hmr: {
        overlay: false,
      },
      // to avoid CORS issues
      // proxy: {
      //   "/api": {
      //     target: "http://localhost:3333",
      //     changeOrigin: true,
      //     rewrite: (path) => path.replace(/^\/api/, "api"),
      //   },
      // },
    },

    build: {
      outDir: 'build',
      target: 'esnext',
    },

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../', import.meta.url)),
        stream: 'readable-stream',
      },
    },

    test: vitestConfig,
  });
};
