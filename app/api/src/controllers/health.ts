import { HealthCheck, Bindings, Env, WorkerEnv, UserRole } from 'types/index';
import {
  createJsonResponse,
  escapeNestedKeys,
  logLevel,
  logger,
  msToTime
} from 'ai-maps-util/index';
import { ServerResponse } from 'http';
import { ExecutionContext, KVNamespace } from '@cloudflare/workers-types';
import { IRequest } from 'itty-router';
// @ts-expect-error
import rawManifest from '__STATIC_CONTENT_MANIFEST';

const FILE_LOG_LEVEL = 'debug';

// https://github.com/cloudflare/wrangler2/issues/1481
// https://community.cloudflare.com/t/how-to-detect-the-cloudflare-worker-runtime/293715
function isWorker() {
  return (
    // @ts-ignore
    typeof WebSocketPair !== 'undefined' || typeof caches !== 'undefined'
  );
}

async function getManifest(env: Env) {
  // console.log(`worker.getManifest: ${JSON.stringify(env)}`);
  // console.log(`is worker env: ${(<Env>env).isWorkerEnv}`);
  // console.log(`is worker: ${isWorker()}`);
  // console.log(`worker.getManifest.mani: ${JSON.parse(mani)}`);
  return isWorker()
    ? // @ts-expect-error
      (await import('__STATIC_CONTENT_MANIFEST')) || ''
    : // ? JSON.parse(
      //     // @ts-expect-error
      //     JSON.stringify(await import("__STATIC_CONTENT_MANIFEST")) || ""
      //   )
      'local';
  //   JSON.parse((await import("__STATIC_CONTENT_MANIFEST")) || "")[
  //     "__STATIC_CONTENT_MANIFEST"
  //   ]
  // : "local";
}

export const healthRes = async (env: Env) => {
  if (!env) {
    throw new Error('env is undefined');
  }
  // const gitInfo = (<Env>env).isWorkerEnv
  const hasNamespace = env.kv !== undefined;
  const gitInfo =
    isWorker() && hasNamespace
      ? JSON.parse((await (env.AI_MAPS_UI as KVNamespace).get('gitInfo')) || '')
      : (await import('@/data/git.json')).default;
  // console.log(`worker.healthRes.gitInfo: ${JSON.stringify(gitInfo)}`);
  const healthRes: HealthCheck = {
    status: 'OK',
    version: await getManifest(env),
    uptime: msToTime(process.uptime()),
    worker_env: env.WORKER_ENVIRONMENT,
    timestamp: new Date(Date.now()),
    gitInfo: gitInfo
  };
  // console.log(`worker.healthRes: ${JSON.stringify(healthRes)}`);
  return healthRes;
};
export const healthCheck = async (req: Request | IRequest, env: Env) => {
  return new Response(JSON.stringify(await healthRes(env), null, 2), {
    headers: { 'content-type': 'application/json' }
  });
};
export const healthCheckPromise = async (req: Request | IRequest, env: Env) => {
  return Promise.resolve(
    new Response(JSON.stringify(await healthRes(env), null, 2), {
      headers: { 'content-type': 'application/json' }
    })
  );
};

export const healthCheckJson = async (req: Request | IRequest, env: Env) => {
  return new Response(JSON.stringify(await healthRes(env), null, 2), {
    headers: { 'content-type': 'application/json' }
  });
};

export const healthCheckRes = async (req: Request, env: Env) => {
  const log = logger(FILE_LOG_LEVEL, env);
  log('worker.healthCheckJson');
  log(`worker.getHealth.healthCheckJson.res: ${JSON.stringify(healthRes(env))}`);
  return await healthRes(env);
};

const parseEnv = async (kv: KVNamespace) => {
  const envVars = await kv.list();
  const out: any = {};
  for (let [k, v] of Object.entries(envVars.keys)) {
    let logObj = escapeNestedKeys(JSON.parse((await kv.get(v.name)) || ''), [
      'token',
      'accessToken'
    ]);

    out[v.name] = logObj;
  }
  return out;
};

export const debugRes = async (
  req: Request,
  res: Response,
  env: Env,
  ctx: ExecutionContext,
  parse = false
) => {
  // const log = logger(FILE_LOG_LEVEL, env);
  // log(`[worker] [health] [debugRes] -> ${req.method} -> ${req.url}`);
  // log(`[worker] [health] [debugRes] -> req.session ->`);
  // console.log(req.session);
  // log(`[worker] [health] [debugRes] -> res.session ->`);
  // console.log(res.session);
  // let sanitizedToken: string | null = null;
  // const session = res.session;
  // const user = session?.user;
  // const role = user?.role;
  // log(`[worker] [health] [debugRes] -> role -> ${role}`);
  // if (!session || !user || role !== UserRole.Admin) {
  //   return null;
  // }
  const excludes = ['token', 'ADMIN_USERS', 'secret', 'client_id'];
  let reqLog = escapeNestedKeys(req, excludes);
  let envLog = escapeNestedKeys(env, excludes);
  // console.log("worker.health.handleHealth.debug.envLog");
  // console.log(reqLog);
  // console.log(envLog);
  // console.log(parse);
  // let manifest;
  // try {
  //   manifest = await getManifest(env);
  //   // console.log(`worker.health.handleHealth.debug.manifest: ${manifest}`);
  // } catch (error) {
  //   console.error(error);
  // }
  const out = {
    req: reqLog,
    cf: req.cf,
    // TODO this is expensive, only do it if needed; add a flag to the request using params
    env: parse
      ? {
          ...envLog,
          AI_MAPS: await parseEnv(env.AI_MAPS_UI as KVNamespace),
          AI_MAPS_USERS: await parseEnv(env.AI_MAPS_USERS as KVNamespace),
          AI_MAPS_SESSIONS: await parseEnv(env.AI_MAPS_SESSIONS as KVNamespace)
        }
      : envLog,
    ctx,
    rawManifest: await getManifest(env)
  };
  // console.log("worker.health.handleHealth.debug.out");
  // console.log(out);
  return out;
};
