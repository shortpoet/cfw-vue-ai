import * as log from '../log';
import { Config, WrangleConfig } from '../types';
import { executeWranglerCommand, formatBindingId, getToml, writeToml } from '../util';
import colors from 'kleur';
import { getNamespace, getPreview } from './namespace';

export async function writeNamespaceToToml(bindingName: string, opts: Config) {
  const bindingId = formatBindingId(opts, { isUi: true }.isUi);
  const namespace = getNamespace(bindingId, opts);
  if (!namespace) {
    throw new Error(`[wrangle] [kv] no namespace for binding ${bindingName}`);
  }
  const namespaceId = namespace.id;
  const previewId = getPreview(bindingId, opts).id;
  console.log(
    colors.green(
      `[wrangle] [kv] Writing binding ${bindingName} to toml ${opts.wranglerFile}
       [wrangle] [kv] namespaceId: ${namespaceId}
       [wrangle] [kv] previewId: ${previewId}`
    )
  );
  // updateToml(`env.${env}.kv_namespaces.0.title`, id);
  const config = await getToml(opts.wranglerFile);
  if (!config) {
    throw new Error('no config');
  }

  let kv_namespaces = config['env'][`${opts.env}`]['kv_namespaces'];

  if (!kv_namespaces) {
    kv_namespaces = [];
  }
  const kv_namespace = kv_namespaces.find((i) => i.binding === bindingName);
  if (kv_namespace && kv_namespace.id === namespaceId && kv_namespace.preview_id === previewId) {
    log.print('yellow', `[kv] binding ${bindingName} already exists in toml ${opts.wranglerFile}`);
    return;
  }
  kv_namespaces = kv_namespaces.concat({
    binding: bindingName,
    id: namespaceId,
    preview_id: previewId,
  });
  config['env'][`${opts.env}`]['kv_namespaces'] = kv_namespaces;
  writeToml(config, opts);
}
