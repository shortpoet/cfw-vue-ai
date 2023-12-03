export {};

import type {
  Request as CFRequest,
  Response as CFResponse,
  D1Database,
  KVNamespace,
} from '@cloudflare/workers-types';
import type { ResponseCfProperties, LogLevel, PageProps, Page, Component } from './types';
import { AssetManifestType } from '@cloudflare/kv-asset-handler/dist/types';

type Mutable<T> = {
  -readonly [K in keyof T]-?: T[K];
};

declare global {
  const __STATIC_CONTENT: KVNamespace;
  const __STATIC_CONTENT_MANIFEST: AssetManifestType;
  const CFW_VUE_AI_KV_UI: KVNamespace;
  const CFW_VUE_AI_DB: D1Database;
  const isWorkerEnv: () => void;

  interface Window {
    initialData: [];
  }
  type NodeEnv = {
    [key: string]: any;
  } & {
    ASSETS: {
      fetch: typeof fetch;
    };
  };
  interface WorkerEnv {
    // APP
    VITE_APP_NAME: string;
    VITE_API_VERSION: string;
    VITE_UI_VERSION: string;
    NODE_ENV: 'development' | 'production';
    WORKER_ENVIRONMENT: 'dev' | 'preview' | 'uat' | 'prod';
    LOG_LEVEL: LogLevel;
    SSR_BASE_PATHS: string;

    // CLOUDFLARE
    CFW_VUE_AI_KV_UI: KVNamespace;

    __STATIC_CONTENT: KVNamespace;
    __STATIC_CONTENT_MANIFEST: AssetManifestType | string;

    // DB
    CFW_VUE_AI_DB: D1Database;

    isWorkerEnv(): void;
    ASSETS: {
      fetch: typeof fetch;
    };
  }

  export type Env = WorkerEnv | NodeEnv | NodeJS.ProcessEnv;

  export interface Request extends CFRequest {
    readonly method: string;
    readonly url: string;
    params?: Record<string, string>;
    query?: Record<string, string>;
    isAuthenticated?: boolean;
    cf: CFRequest['cf'];
    cf_summary?: Partial<CFRequest['cf']>;
    // user?: User | null;
    // session?: Omit<Database['Session'], 'id'>;
    // auth?: Auth | null;
  }

  export interface Response extends CFResponse {
    cf?: ResponseCfProperties;
    webSocket?: WebSocket;
    encodeBody?: 'automatic' | 'manual' | undefined;
    // session?: Session | null;
  }
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      WORKER_ENVIRONMENT: 'dev' | 'preview' | 'uat' | 'prod';
      LOG_LEVEL: LogLevel;
      API_VERSION: string;
      UI_VERSION: string;
      VITE_APP_NAME: string;
      // CFW_VUE_AI_KV_UI: KVNamespace;
      // CFW_VUE_AI_DB: D1Database;
    }
    interface ImportMeta {
      env: {
        NODE_ENV: 'development' | 'production';
        WORKER_ENVIRONMENT: 'dev' | 'preview' | 'uat' | 'prod';
        LOG_LEVEL: LogLevel;
        API_VERSION: string;
        UI_VERSION: string;
        VITE_APP_NAME: string;
        // CFW_VUE_AI_KV_UI: KVNamespace;
        // CFW_VUE_AI: D1Database;
      };
    }
  }
  namespace Vike {
    interface PageContext {
      Page: Page;
      pageProps?: PageProps;
      urlPathname: string;
      Layout: Component;
      redirectTo?: string;
      exports: {
        documentProps?: {
          title?: string;
          description?: string;
        };
      };
      // httpResponse: HttpResponse;
      _allPageIds: string[];
      isAdmin: boolean;
      csrfToken: string;
      callbackUrl: string;
      cf: ResponseCfProperties;
      abortReason?: {
        message: string;
        notAdmin?: boolean | undefined;
        noSession?: boolean | undefined;
      };
    }
  }
}

declare module '__STATIC_CONTENT_MANIFEST' {
  const content: string;
  export default content;
}
