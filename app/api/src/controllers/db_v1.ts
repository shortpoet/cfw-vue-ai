import { q } from '@ai-maps/db/src';
import { Env } from '@/types';
import { uuidv4 } from '@/ai-maps-util';

export const getUsersFind = async (
  req: Request,
  response: Response,
  env: Env,
  context: ExecutionContext
) => {
  const result = await q.getAllUsers(env);
  if (!result) {
    return new Response('No value found', {
      status: 404
    });
  }
  return new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
