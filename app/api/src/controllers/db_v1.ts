import { q } from '@cfw-vue-ai/db/src';
import { uuidv4 } from '@cfw-vue-ai/utils';

export const getUsersFind = async (
  req: Request,
  response: Response,
  env: Env,
  context: ExecutionContext
) => {
  const result = await q.getAllUsers(env);
  if (!result) {
    return new Response('No value found', {
      status: 404,
    });
  }
  return new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
