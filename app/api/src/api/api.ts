import { ExecutionContext } from '@cloudflare/workers-types';
import { ServerResponse } from 'http';

import router from './router';

const FILE_LOG_LEVEL = 'error';

const Api = {
  handle: (req: Request, resp: Response | ServerResponse, env: Env, ctx: ExecutionContext) => {
    const out = router.handle(req, resp, env, ctx);
    return out;
  },
};

export { Api };
