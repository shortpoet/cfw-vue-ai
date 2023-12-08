export {};

import type {
  Request as CFRequest,
  Response as CFResponse,
  D1Database,
  KVNamespace,
} from '@cloudflare/workers-types';
import { Session } from '@auth/core/types';
import { AssetManifestType } from '@cloudflare/kv-asset-handler/dist/types';
import type {
  ResponseCfProperties,
  LogLevel,
  PageProps,
  Page,
  Component,
  ListOptions,
  User,
  // Session,
  UserRole,
  UserType,
  SessionUnion,
} from './types/src';
import { Database } from './db/src';

type Mutable<T> = {
  -readonly [K in keyof T]-?: T[K];
};

declare global {
  // const __STATIC_CONTENT: KVNamespace;
  // const __STATIC_CONTENT_MANIFEST: AssetManifestType;
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
  export type Bindings = Record<string, unknown>;
  interface WorkerEnv {
    // APP
    NODE_ENV: 'development' | 'production';
    WORKER_ENVIRONMENT: 'dev' | 'preview' | 'uat' | 'prod';
    VITE_PORT: string;
    VITE_APP_NAME: string;
    VITE_API_VERSION: string;
    VITE_UI_VERSION: string;
    VITE_LOG_LEVEL: LogLevel;
    VITE_APP_URL: string;
    VITE_API_URL: string;
    SSR_BASE_PATHS: string;

    // CLOUDFLARE
    CFW_VUE_AI_KV_UI: KVNamespace;

    __STATIC_CONTENT: KVNamespace;
    __STATIC_CONTENT_MANIFEST: AssetManifestType | string;

    // DB
    CFW_VUE_AI_DB: D1Database;

    // AUTH
    __SECRET__: string;
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    JMAP_TOKEN: string;
    EMAIL_SERVER_HOST: string;
    EMAIL_SERVER_PORT: string;
    EMAIL_SERVER_USER: string;
    EMAIL_SERVER_PASSWORD: string;
    EMAIL_FROM: string;

    isWorkerEnv(): void;
    ASSETS: {
      fetch: typeof fetch;
    };
  }

  type Env = WorkerEnv | NodeEnv | NodeJS.ProcessEnv;
  interface CredsAuth {
    sanitizedUser: string;
    user: User;
    token: string;
  }

  interface Request extends CFRequest {
    readonly method: string;
    readonly url: string;
    readonly headers: Headers;
    params?: Record<string, string>;
    query?: Record<string, string>;
    isAuthenticated?: boolean;
    cf: CFRequest['cf'];
    cf_summary?: Partial<CFRequest['cf']>;
    listOptions?: ListOptions;
    user?: User | null;
    session?: Omit<Database['Session'], 'id'>;
    credsAuth?: CredsAuth | null;
  }

  interface Response extends Response {}

  interface Response extends CFResponse {
    cf?: ResponseCfProperties;
    webSocket?: WebSocket;
    encodeBody?: 'automatic' | 'manual' | undefined;
    session?: Session | null;
  }
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      WORKER_ENVIRONMENT: 'dev' | 'preview' | 'uat' | 'prod';
      VITE_PORT: string;
      VITE_LOG_LEVEL: LogLevel;
      VITE_APP_NAME: string;
      VITE_API_VERSION: string;
      VITE_UI_VERSION: string;
      VITE_APP_URL: string;
      VITE_API_URL: string;
      SSR_BASE_PATHS: string;
      __SECRET__: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
      JMAP_TOKEN: string;
      EMAIL_SERVER_HOST: string;
      EMAIL_SERVER_PORT: string;
      EMAIL_SERVER_USER: string;
      EMAIL_SERVER_PASSWORD: string;
      EMAIL_FROM: string;
    }

    interface ImportMeta {
      env: {
        NODE_ENV: 'development' | 'production';
        WORKER_ENVIRONMENT: 'dev' | 'preview' | 'uat' | 'prod';
        VITE_PORT: string;
        VITE_APP_NAME: string;
        VITE_API_VERSION: string;
        VITE_UI_VERSION: string;
        VITE_LOG_LEVEL: LogLevel;
        VITE_APP_URL: string;
        VITE_API_URL: string;
        SSR_BASE_PATHS: string;
        __SECRET__: string;
        NEXTAUTH_URL: string;
        NEXTAUTH_SECRET: string;
        GITHUB_CLIENT_ID: string;
        GITHUB_CLIENT_SECRET: string;
        JMAP_TOKEN: string;
        EMAIL_SERVER_HOST: string;
        EMAIL_SERVER_PORT: string;
        EMAIL_SERVER_USER: string;
        EMAIL_SERVER_PASSWORD: string;
        EMAIL_FROM: string;
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
      session: SessionUnion | null;
      isAdmin: boolean;
      csrfToken: string;
      callbackUrl: string;
      sessionToken: string;
      pkceCodeVerifier: string;
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

declare module '@auth/core/adapters' {
  interface User {
    emailVerified?: boolean;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    roles: UserRole[];
    userType: UserType;
  }
}

declare module '@auth/core/types' {
  interface Session {
    user?: User & DefaultSession['user'] & Omit<Database['User'], 'id'>;
  }
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    roles: UserRole[];
    userType: UserType;
  }
}
declare module '@auth/core/jwt' {
  interface JWT {
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    sub?: string;
    sessionToken?: string;
  }
}
