import { badResponse } from './response';
import { ListOptions } from '@cfw-vue-ai/types';

const FILE_LOG_LEVEL = 'debug';

export const withListOptions = (request: Request) => {
  const { query } = request;
  if (!query) {
    return;
  }
  const { limit, cursor, indexKey } = query;

  const listOptions = {} as ListOptions;
  if (limit) {
    const limitAsNumber = Number(limit);

    if (limitAsNumber !== limitAsNumber) {
      return badResponse(new Error('[limit] query must be a number.'));
    }

    if (limitAsNumber > 1000 || limitAsNumber < 1) {
      return badResponse(new Error('[limit] query must be between 1 and 1000.'));
    }

    listOptions.limit = limitAsNumber;
  }

  if (cursor) {
    listOptions.cursor = cursor;
  }
  if (indexKey) {
    listOptions.indexKey = indexKey;
  }

  request.listOptions = listOptions;
};

export const withCfSummary =
  ({ level = 'basic' } = {}) =>
  async (request: Request, env: Env) => {
    console.log(`[worker] middlware.withCfSummary -> ${request.method} -> ${request.url}`);
    request.cf_summary = request.cf
      ? {
          longitude: request.cf.longitude,
          latitude: request.cf.latitude,
          country: request.cf.country,
          tlsVersion: request.cf.tlsVersion,
          colo: request.cf.colo,
          timezone: request.cf.timezone,
          city: request.cf.city,
          region: request.cf.region,
          regionCode: request.cf.regionCode,
          asOrganization: request.cf.asOrganization,
          postalCode: request.cf.postalCode,
          metroCode: request.cf.metroCode,
          botManagement: request.cf.botManagement,
        }
      : {};
  };
export const withCfHeaders =
  ({ level = 'basic' } = {}) =>
  async (request: Request, res: Response, env: Env) => {
    console.log(`[worker] middlware.withCfHeaders -> ${request.method} -> ${request.url}`);
    const { cf } = request;
    if (cf) {
      const { colo, clientTcpRtt } = cf;
      if (clientTcpRtt) {
        res.headers.set('x-client-tcp-rtt', clientTcpRtt.toString());
      }
      if (colo) {
        res.headers.set('x-colo', colo.toString());
      }
    }
    res.headers.set('x-api-env', env.NODE_ENV);
  };
