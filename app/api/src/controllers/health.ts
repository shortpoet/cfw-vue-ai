import { HealthCheck, UserRole } from '@cfw-vue-ai/types';
import { escapeNestedKeys, logLevel, logger, msToTime } from '@cfw-vue-ai/utils';
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
  return isWorker()
    ? // @ts-expect-error
      (await import('__STATIC_CONTENT_MANIFEST')) || ''
    : 'local';
}

export const healthRes = async (env: Env) => {
  if (!env) {
    throw new Error('env is undefined');
  }
  const hasNamespace = env.CFW_VUE_AI_UI !== undefined;
  let gitInfo;
  try {
    gitInfo =
      isWorker() && hasNamespace
        ? JSON.parse((await (env.CFW_VUE_AI_UI as KVNamespace).get('gitInfo')) || '')
        : (await import('@cfw-vue-ai/db/src/data.json')).default;
  } catch (error) {
    console.error(`[api] [controllers] [health] [healthRes] gitInfo error: ${error}`);
  }

  const healthRes: HealthCheck = {
    status: 'OK',
    version: await getManifest(env),
    uptime: 'TODO',
    // uptime: msToTime(process.uptime()),
    worker_env: env.WORKER_ENVIRONMENT,
    timestamp: new Date(Date.now()),
    gitInfo: gitInfo,
  };
  return healthRes;
};

export const healthCheck = async (req: Request | IRequest, env: Env) => {
  return new Response(JSON.stringify(await healthRes(env), null, 2), {
    headers: { 'content-type': 'application/json' },
  });
};
export const healthCheckPromise = async (req: Request | IRequest, env: Env) => {
  return Promise.resolve(
    new Response(JSON.stringify(await healthRes(env), null, 2), {
      headers: { 'content-type': 'application/json' },
    })
  );
};

export const healthCheckJson = async (req: Request | IRequest, env: Env) => {
  return new Response(JSON.stringify(await healthRes(env), null, 2), {
    headers: { 'content-type': 'application/json' },
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
  try {
    for (let [k, v] of Object.entries(envVars.keys)) {
      let logObj = escapeNestedKeys(JSON.parse((await kv.get(v.name)) || ''), [
        'token',
        'accessToken',
      ]);

      out[v.name] = logObj;
    }
  } catch (error) {
    console.error(`[api] [controllers] [health] [parseEnv] error: ${error}`);
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
  const excludes = ['token', 'ADMIN_USERS', 'secret', 'client_id'];
  let reqLog = escapeNestedKeys(req, excludes);
  let envLog = escapeNestedKeys(env, excludes);
  const out = {
    req: reqLog,
    cf: req.cf,
    // TODO this is expensive, only do it if needed; add a flag to the request using params
    env: parse
      ? {
          ...envLog,
          CFW_VUE_AI_UI: await parseEnv(env.CFW_VUE_AI_UI as KVNamespace),
          // CFW_VUE_AI_KV_USERS: await parseEnv(env.CFW_VUE_AI_KV_USERS as KVNamespace),
          // CFW_VUE_AI_KV_SESSIONS: await parseEnv(env.CFW_VUE_AI_KV_SESSIONS as KVNamespace),
        }
      : envLog,
    ctx,
    rawManifest: await getManifest(env),
  };
  return out;
};
