export { WrangleConfig, Options };
type WrangleConfig = {
  env: 'dev' | 'preview' | 'uat' | 'prod';
  wranglerFile: string;
  envFile: string;
  debug: boolean;
};

type Arrayable<T> = T | T[];
type Nullable<T> = T | null;

interface Options {
  cwd: string;
  /** Name of source directory */
  dir: string;
  env?: 'dev' | 'preview' | 'uat' | 'prod';
  debug?: boolean;
  only?: Arrayable<string>;
  ignore?: Arrayable<string>;
}
