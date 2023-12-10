export { WrangleConfig, Options, Config, Arrayable, Nullable, Argv, WranglerToml };
type WrangleConfig = {
  env: 'dev' | 'qa' | 'uat' | 'prod';
  wranglerFile: string;
  envFile: string;
  debug: boolean;
};

type Arrayable<T> = T | T[];
type Nullable<T> = T | null;

interface Argv {
  cwd: string;
  dir: string;
  env?: 'dev' | 'qa' | 'uat' | 'prod';
  debug?: boolean;
}

interface Options {
  cwd: string;
  goLive?: boolean;
  /** Name of source directory */
  dir?: string;
  env?: 'dev' | 'qa' | 'uat' | 'prod';
  debug?: boolean;
  only?: Arrayable<string>;
  ignore?: Arrayable<string>;
  migration?: string;
  bindingName?: string;
}

type Config = {
  cwd: string;
  goLive: boolean;
  dir: string;
  env: 'dev' | 'qa' | 'uat' | 'prod';
  envVars: Record<string, string>;
  debug: boolean;
  envFile: string;
  wranglerFile: string;
  appName: string;
  bindingNameUI: string;
  bindingNameDb: string;
  bindingIdUi: string;
  databaseName: string;
  secrets: Record<string, string>;
  only?: Arrayable<string>;
  ignore?: Arrayable<string>;
};

interface WranglerTomlCommon {
  [key: string]: string | number | boolean | Record<string, unknown> | Array<unknown> | undefined;
  name: string;
  route?: string;
  zone_id?: string;
  routes?: Array<{
    pattern: string;
    script: string;
    metadata?: Record<string, string>;
  }>;
  kv_namespaces?: Array<{
    binding: string;
    id: string;
    preview_id: string;
  }>;
  site?: {
    bucket: string;
    entry_point?: string;
    include?: Array<string>;
    exclude?: Array<string>;
  };
  d1_databases?: Array<{
    binding: string;
    database_name: string;
    database_id: string;
  }>;
  vars?: Record<string, string>;
}
interface WranglerToml extends Partial<WranglerTomlCommon> {
  [key: string]: string | number | boolean | Record<string, unknown> | Array<unknown> | undefined;
  env: Record<string, WranglerTomlCommon>;
  type?: string;
  account_id?: string;
  compatibility_date?: string;
  node_compat?: boolean;
  workers_dev?: boolean;
  main?: string;
}
