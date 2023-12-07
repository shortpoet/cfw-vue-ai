import { IRequest } from 'itty-router';
import { OpenAPIRouter } from '@cloudflare/itty-router-openapi';
import { debugRes, healthCheck, healthCheckJson } from '@/api/src/api/controllers';
import { jsonData } from '../middleware';
import { Env } from '@/types';
import { corsify } from '../v1';
import { getPost, getPosts, addPost, delPost } from '../controllers/post';

type CF = [env: Env, context: ExecutionContext];
const router = OpenAPIRouter<IRequest, CF>({ base: '/api/health' });

router.get('/api/posts/:key', ...getPost);
router.get('/api/posts', ...getPosts);
router.post('/api/posts', ...addPost);
router.delete('/api/posts/:key', ...delPost);
