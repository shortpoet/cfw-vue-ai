import { render, redirect } from 'vike/abort';
import { PageContext, UserRole } from '@cfw-vue-ai/types';
import type { GuardAsync } from 'vike/types';

interface GuardProtectedRoutes {
  route: string;
  isAdmin: boolean;
}

export const useGuard = async (
  pageContext: PageContext,
  route: string,
  protectedRoutes: Record<string, GuardProtectedRoutes>
): ReturnType<GuardAsync> => {
  const { urlPathname } = pageContext;
  console.log(`[ui] [guard] [${route}] urlPathname: ${urlPathname}`);
  console.log(`[ui] [guard] [${route}] protectedRoutes: ->`);
  console.log(protectedRoutes);

  const { session } = pageContext;
  const user = session?.user;
  const roles = user?.roles;
  const redirectTo = user ? undefined : '/auth/login';

  if (Object.keys(protectedRoutes).includes(urlPathname)) {
    console.log(`\n[ui] [guard]\n[ui] [guard] [${route}] START redirectTo: ${redirectTo}`);
    console.log(`[ui] [guard] [${route}] roles: ${roles}`);
    console.log(`[ui] [guard] [${route}] protectedRoutes[urlPathname]: ->`);
    console.log(protectedRoutes[urlPathname]);
    // console.log(`[ui] [guard] [${route}] protectedRoutes: ->`);
    // console.log(protectedRoutes);
    // console.log(`[ui] [guard] [${route}] session: ->`);
    // console.log(session);
    // console.log(`[ui] [guard] [${route}] user: ->`);
    // console.log(user);

    if (protectedRoutes[urlPathname].isAdmin && !roles?.includes(UserRole.Admin)) {
      // Render the error page and show message to the user
      console.log(
        `[ui] [guard] [${route}] protectedRoutes.includes(${urlPathname}) && !user && !isAdmin`
      );
      throw render(403, {
        noSession: false,
        notAdmin: !roles?.includes(UserRole.Admin),
        message: 'Only admins are allowed to access this page.',
      });
    }

    console.log(`[ui] [guard] [${route}] protectedRoutes.includes(${urlPathname}) && !user`);

    // Render the login page while preserving the URL. (This is novel technique
    // which we explain down below.)
    if (redirectTo) {
      console.log(`[ui] [guard] [${route}] END redirectTo: ${redirectTo}\n`);
      throw render('/auth/login');
    }
    /* The more traditional way, redirect the user:
    throw redirect('/login')
    */
  }
};
