import { IRequest } from 'itty-router';
import { OpenAPIRouter } from '@cloudflare/itty-router-openapi';
import { getUsersFind } from '../../controllers';

type CF = [env: Env, ctx: ExecutionContext];
const router = OpenAPIRouter<IRequest, CF>({ base: '/api/db-v1' });

router.get('/find', async (req: Request, res: Response, env: Env, ctx: ExecutionContext) => {
  console.log(`[api] [auth-db_v1] [find]`);
  return await getUsersFind(req, res, env, ctx);
});

export default router;
