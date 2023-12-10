import chalk from 'chalk';
import { Env } from './wrangle';
import { getToml, writeToml, executeWranglerCommand, formatBindingId } from '../scripts/src/util';

export { assertDatabase };

// function getDatabases(env: Env) {
//   try {
//     return JSON.parse(executeWranglerCommand('d1 list --json', env.env));
//   } catch (error) {
//     if (error.toString().includes('SyntaxError')) {
//       return [];
//     } else {
//       throw error;
//     }
//   }
// }

// function getDatabase(name: string, env: Env) {
//   const n = getDatabases(env);
//   console.log(chalk.cyan('[wrangle] [db] get name', name));
//   return n.find((i) => i.name === name) || {};
// }

// function createDatabase(databaseName: string, env: Env) {
//   console.log(chalk.green(`[wrangle] [db] creating database ${databaseName}`));
//   const res = executeWranglerCommand(`d1 create ${databaseName}`, env.env);
//   if (!res) {
//     throw new Error('no response');
//   }
//   if (res.includes('error')) {
//     throw new Error(res);
//   }
//   const database = res.match(/(?<=database_id = ).*/g);
//   if (!database) {
//     throw new Error('no database id in response');
//   }
//   const databaseId = database[0].replace(/"/g, '');
//   console.log(
//     chalk.green(`[wrangle] [db] created database [name] ${databaseName} [id] ${databaseId}`)
//   );
//   console.log(res);
//   return databaseId;
// }

// function deleteDatabase(databaseName: string, env: Env) {
//   console.log(chalk.green(`[wrangle] [db] deleting database ${databaseName}`));
//   const res = executeWranglerCommand(`d1 delete ${databaseName}`, env.env);
//   if (!res) {
//     throw new Error('no response');
//   }
//   if (res.includes('error')) {
//     throw new Error(res);
//   }
//   console.log(res);
//   return res;
// }

// function createMigration(databaseName: string, subCommand: string, env: Env) {
//   console.log(
//     chalk.green(
//       `[wrangle] [db] creating migration for [database name] ${databaseName} [mig name] ${subCommand}`
//     )
//   );
//   const res = executeWranglerCommand(`d1 migrations create ${databaseName} ${subCommand}`, env.env);
//   if (!res) {
//     throw new Error('no response');
//   }
//   if (res.includes('error')) {
//     throw new Error(res);
//   }
//   console.log(res);
//   const migration = res.match(/'(.*)'!/g);
//   if (!migration) {
//     throw new Error('no migration id in response');
//   }
//   const migrationId = migration[0].replace(/'\!/g, '');
//   console.log(
//     chalk.green(
//       `[wrangle] [db] created migration [name] ${subCommand} for database [name] ${databaseName}`
//     )
//   );
//   console.log(res);
//   return migrationId;
// }

// function applyMigration(databaseName: string, env: Env, debug?: boolean) {
//   console.log(chalk.green(`[wrangle] [db] applying to database [name] ${databaseName}`));
//   let localSwitch = '';
//   if (env.env === 'preview') {
//     localSwitch = `--local`;
//   }

//   const res = executeWranglerCommand(`d1 migrations apply ${databaseName} ${localSwitch}`, env.env);
//   if (!res) {
//     throw new Error('no response');
//   }
//   if (res.includes('error')) {
//     throw new Error(res);
//   }
//   console.log(res);
//   return res;
// }

// async function executeD1Sql(
//   databaseName: string,
//   env: Env,
//   file?: string,
//   sql?: string,
//   debug?: boolean
// ) {
//   let cmd;
//   let base = `d1 execute`;
//   if (env.env === 'preview') {
//     base = `${base} --local`;
//   }
//   if (sql) {
//     cmd = `${base} ${databaseName} --command "${sql}"`;
//   }
//   if (file) {
//     cmd = `${base} ${databaseName} --file ${file}`;
//   }
//   if (!cmd) {
//     throw new Error('no d1 execute command');
//   }
//   const res = executeWranglerCommand(cmd, env.env);
//   if (!res) {
//     throw new Error('no response');
//   }
//   if (res.includes('error')) {
//     throw new Error(res);
//   }
//   console.log(res);
//   return res;
// }

// async function assertDatabase(
//   bindingName: string,
//   appName: string,
//   env: Env,
//   tomlPath: string,
//   subCommand?: string,
//   dbCommand?: string,
//   debug?: boolean
// ) {
//   console.log(
//     chalk.green(
//       `[wrangle] [db] Asserting database bindings for ${bindingName} in env ${env.env} wrangler env ${env.env}
//       \t\tapp ${appName} toml ${tomlPath} debug ${debug}`
//     )
//   );
//   let databaseId;
//   const databaseName = formatBindingId(bindingName, env, appName);

//   const database = getDatabase(databaseName, env);
//   console.log(database);
//   databaseId = database.uuid;
//   console.log(databaseId);

//   if (!databaseId && dbCommand !== 'delete') {
//     console.log(chalk.green(`[wrangle] [db] creating database ${databaseName}`));
//     databaseId = createDatabase(databaseName, env);
//   }
//   console.log(chalk.green(`[wrangle] [db] databaseId ${databaseId} for binding ${bindingName}`));
//   writeDatabaseToToml(
//     bindingName,
//     databaseId,
//     databaseName,
//     tomlPath,
//     env,
//     dbCommand === 'delete',
//     debug
//   );

//   const isDelete = dbCommand === 'delete' && !!databaseId;

//   switch (true) {
//     case dbCommand === 'create':
//       if (!subCommand) {
//         throw new Error('no migration name');
//       }
//       createMigration(databaseName, subCommand, env);
//       break;
//     case dbCommand === 'apply':
//       applyMigration(databaseName, env, debug);
//       break;
//     case dbCommand === 'sql':
//       executeD1Sql(databaseName, env, undefined, subCommand, debug);
//       break;
//     case dbCommand === 'file':
//       dbCommand = dbCommand?.split(':')[1];
//       executeD1Sql(databaseName, env, subCommand, undefined, debug);
//       break;
//     case isDelete:
//       deleteDatabase(databaseName, env);
//       break;
//     case dbCommand !== undefined && isDelete:
//       throw new Error('invalid migration command');
//     default:
//       return;
//       break;
//   }
// }

// function writeDatabaseToToml(
//   bindingName: string,
//   databaseId: string,
//   databaseName: string,
//   tomlPath: string,
//   env: Env,
//   deleteDb: boolean = false,
//   debug: boolean = false
// ) {
//   const env_name = env.env;
//   console.log(
//     chalk.green(
//       `[wrangle] [db] Writing binding ${bindingName} to toml ${tomlPath}
//       [wrangle] [db] databaseId: ${databaseId}`
//     )
//   );

//   const config = getToml(tomlPath);
//   if (!config) {
//     throw new Error('no config');
//   }
//   // console.log(chalk.magenta(`[wrangle] [db] db before:`));

//   let databases = config['env'][`${env_name}`]['d1_databases'];
//   if (!databases) {
//     databases = [];
//   }

//   if (deleteDb) {
//     console.log(
//       chalk.yellow(`[wrangle] [db] deleting binding ${bindingName} from toml ${tomlPath}`)
//     );
//     databases = databases.filter((i) => i.binding !== bindingName);
//     if (databases.length === 0) {
//       delete config['env'][`${env_name}`]['d1_databases'];
//     }
//   } else {
//     const database = databases.find((i) => i.binding === bindingName);
//     if (database && database.database_id === databaseId) {
//       console.log(
//         chalk.yellow(`[wrangle] [db] binding ${bindingName} already exists in toml ${tomlPath}`)
//       );
//       return;
//     }
//     databases = databases.concat({
//       binding: bindingName,
//       database_name: databaseName,
//       database_id: databaseId,
//     });
//     config['env'][`${env_name}`]['d1_databases'] = databases;
//   }
//   // console.log(chalk.magenta(`[wrangle] [db] config after:`));
//   // console.log(config["env"][`${env_name}`]);
//   writeToml(config, tomlPath);
// }
