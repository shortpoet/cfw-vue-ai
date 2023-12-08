import { PageContext } from '@cfw-vue-ai/types';
import type { GuardAsync } from 'vike/types';
import { useGuard } from '../../../composables';

const route = '/api-data/debug';
const debugRoute = `${route}`;
const protectedRoutes = {
  '': { route: '', isAdmin: false },
  [debugRoute]: { route: debugRoute, isAdmin: true },
};

export const guard = async (pageContext: PageContext): ReturnType<GuardAsync> =>
  useGuard(pageContext, route, protectedRoutes);
