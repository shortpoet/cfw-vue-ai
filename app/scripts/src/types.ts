export { WrangleConfig, Options, Config, Arrayable, Nullable, Argv };
type WrangleConfig = {
  env: 'dev' | 'preview' | 'uat' | 'prod';
  wranglerFile: string;
  envFile: string;
  debug: boolean;
};

type Arrayable<T> = T | T[];
type Nullable<T> = T | null;

interface Argv {
  cwd: string;
  dir: string;
  env?: 'dev' | 'preview' | 'uat' | 'prod';
  debug?: boolean;
}

interface Options {
  cwd: string;
  /** Name of source directory */
  dir: string;
  env?: 'dev' | 'preview' | 'uat' | 'prod';
  debug?: boolean;
  only?: Arrayable<string>;
  ignore?: Arrayable<string>;
}

interface Config {
  cwd: string;
  dir: string;
  env: 'dev' | 'preview' | 'uat' | 'prod';
  debug: boolean;
  envFile: string;
  wranglerFile: string;
  only?: Arrayable<string>;
  ignore?: Arrayable<string>;
}
