import { jsonOkResponse } from './response';
import { JsonData } from '../../../types/src';
import { createCors } from 'itty-router';
// import { KVPrefix, Prefix } from 'cf-kvprefix'
// import posts from './post/prefix'
// import users from './auth/prefix'
const { preflight, corsify } = createCors();

export function jsonData(req: Request, res: Response, env: Env, data: JsonData) {
  console.log(`[api] middlware.jsonData -> ${req.method} -> ${req.url} -> req`);
  console.log(data);
  return jsonOkResponse(data, res);
}

export function jsonDataCorsify(data: unknown) {
  return Promise.resolve(
    corsify(
      new Response(JSON.stringify(data, null, 2), {
        headers: { 'content-type': 'application/json' },
      })
    )
  );
}
