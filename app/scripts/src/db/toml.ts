import colors from 'kleur';
import { Config } from '../types';
import { formatBindingId, getToml, writeToml } from '../util';

export async function writeDatabaseToToml(
  databaseId: string,
  opts: Pick<Config, 'env' | 'debug' | 'wranglerFile' | 'bindingNameDb' | 'databaseName'>,
  deleteDb: boolean = false,
  debug: boolean = false
) {
  const { bindingNameDb, wranglerFile, env, databaseName } = opts;
  console.log(
    colors.green(
      `[wrangle] [db] Writing binding ${bindingNameDb} to toml ${wranglerFile}
      [wrangle] [db] databaseId: ${bindingNameDb}`
    )
  );

  const config = await getToml(wranglerFile);
  if (!config) {
    throw new Error('[wrangle] [db] no config');
  }

  let databases = config['env'][`${env}`]['d1_databases'];
  if (!databases) {
    databases = [];
  }

  if (deleteDb) {
    console.log(
      colors.yellow(`[wrangle] [db] deleting binding ${bindingNameDb} from toml ${wranglerFile}`)
    );
    databases = databases.filter((i) => i.binding !== bindingNameDb);
    if (databases.length === 0) {
      delete config['env'][`${env}`]['d1_databases'];
    }
  } else {
    const database = databases.find((i) => i.binding === bindingNameDb);
    if (database && database.database_id === databaseId) {
      console.log(
        colors.yellow(
          `[wrangle] [db] binding ${bindingNameDb} already exists in toml ${wranglerFile}`
        )
      );
      return;
    }
    databases = databases.concat({
      binding: bindingNameDb,
      database_name: databaseName,
      database_id: databaseId,
    });
    config['env'][`${env}`]['d1_databases'] = databases;
  }
  // console.log(colors.magenta(`[wrangle] [db] config after:`));
  // console.log(config["env"][`${env_name}`]);
  writeToml(config, { wranglerFile, debug });
}
