import { getCookieAuthToken, logger, logObjs } from '@cfw-vue-ai/utils';
const FILE_LOG_LEVEL = 'debug';

export const withUser =
  ({ required = true } = {}) =>
  async (req: Request, res: Response, env: Env, ctx: ExecutionContext) => {
    const log = logger(FILE_LOG_LEVEL, env);
    log(`[worker] auth.middlware.withUser -> ${req.method} -> ${req.url}`);
    if (required) log(`[worker] auth.middlware.withUser -> required -> ${required} `);
    const created_at = Date.now();
    const token = 'token';
    req.auth = {
      sanitizedUser: '',
      user: {
        username: 'carlos',
        created_at,
      },
      token,
    };
  };
