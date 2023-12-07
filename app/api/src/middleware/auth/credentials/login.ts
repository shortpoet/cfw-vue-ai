import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

import { Env } from '@/types';
import { badResponse, notFoundResponse, okResponse, withCfSummary } from '../../response';
import ZSchema from 'z-schema';
import { sanitizeUser } from './user';

const validator = new ZSchema({});

interface LoginData {
  username: string;
  password: string;
}

const schema = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    password: { type: 'string' }
  },
  required: ['username', 'password']
};

const credentialsLoginSchema = {
  id: 'credentialsLoginDetails',
  type: 'object',
  properties: {
    username: { type: 'string' },
    password: { type: 'string' }
  }
};

export default [
  withCfSummary,
  async (req: Request, response: Response, env: Env, context: ExecutionContext) => {
    const { auth } = req;
    if (auth) return new Response(auth.sanitizedUser);

    const formData = await req.json();

    // const zForm = z.object({
    //   id: z.number().optional(),
    //   kind: z.enum(["r2"]),
    //   key: z.string(),
    //   glob: z.string(),
    //   public: z.boolean(),
    //   readOnly: z.boolean(),
    // });

    const isValid = validator.validate(formData, [credentialsLoginSchema]);
    var error = validator.getLastError();
    //if (!isValid) return new Response(error, { status: 400 })

    const { username, password } = formData as LoginData;
    console.log(formData);
    // const user = await env.AI_MAPS_USERS.getData(username, "username");
    if (!user) return notFoundResponse(new Error(`User does not exists.`));

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return badResponse(new Error(`Invalid password.`));

    const newToken = nanoid();
    const ttl = 60 * 60 * 4; // 4 hours
    // await env.AI_MAPS_TOKENS.putData(newToken, user.key, {
    //   expirationTtl: ttl,
    // });

    response.headers.set('Set-Cookie', `token=${newToken}; Max-Age=${ttl}; Path=/`);

    return okResponse(sanitizeUser(user), response);
  }
];
