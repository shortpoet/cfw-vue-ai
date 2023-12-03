import { ExecutionContext } from '@cloudflare/workers-types';

import router from './router';
import { ServerResponse } from 'http';

const FILE_LOG_LEVEL = 'error';

const Api = {
  handle: (req: Request, resp: Response | ServerResponse, env: Env, ctx: ExecutionContext) => {
    const out = router.handle(req, resp, env, ctx);
    return out;
  },
};

export { Api };
