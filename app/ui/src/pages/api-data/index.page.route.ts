import { PageContext } from 'types/index';
import type { GuardAsync } from 'vike/types';
import { useGuard } from '@/ui/src/composables';
const route = 'api-data';
const debugRoute = `/${route}/debug`;
const protectedRoutes = {
  '': { route: '', isAdmin: false },
  [debugRoute]: { route: debugRoute, isAdmin: true }
};
export const guard = async (pageContext: PageContext): ReturnType<GuardAsync> =>
  useGuard(pageContext, route, protectedRoutes);
