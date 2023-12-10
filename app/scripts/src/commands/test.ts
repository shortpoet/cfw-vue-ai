import colors from 'kleur';
import * as utils from '../util';
import * as log from '../log';
import { getNamespaces } from '../kv';

type WrangleConfig = {
  env: 'dev' | 'preview' | 'uat' | 'prod';
  envFile: string;
  debug: boolean;
};
interface Argv {
  env?: 'dev' | 'preview' | 'uat' | 'prod';
  debug?: boolean;
}

export async function list(opts: Argv) {
  const env = opts.env || 'dev';
  const debug = opts.debug || false;
  const envFile =
    env === 'prod'
      ? '.env.prod'
      : // : env === "preview"
        // ? ".env.preview"
        env === 'uat'
        ? '.env.uat'
        : '.env.preview';

  log.info('Retrieving KV namespaces:');
  const items = await getNamespaces({ env, envFile, debug });
  // const GAP = '    ',
  //   TH = colors.dim().bold().italic;
  // log.success(TH('ID') + ' '.repeat(30) + GAP + TH('Title'));

  // let i = 0,
  //   arr = items.result,
  //   tmp = ''; // ID => 32 chars
  // for (; i < arr.length; i++) {
  //   if (tmp) tmp += '\n';
  //   tmp += (arr[i].supports_url_encoding ? colors.cyan : colors.red)(log.ARROW);
  //   tmp += arr[i].id + GAP + arr[i].title;
  // }

  console.log(items);
}
