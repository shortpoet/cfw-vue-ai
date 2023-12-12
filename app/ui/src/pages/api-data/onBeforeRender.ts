import { PageContext, UserRole } from '@cfw-vue-ai/types';

export { onBeforeRender };
import { render, redirect } from 'vike/abort';
import { RequestConfig, useFetch } from '../../composables';
import { ref } from 'vue';

async function onBeforeRender(
  pageContext: PageContext
): Promise<{ pageContext: Partial<PageContext> }> {
  const user = pageContext.session?.user;
  const { urlPathname, csrfToken, sessionToken, callbackUrl } = pageContext;
  console.log(`[ui] [api-data] [onBeforeRender] urlPathname: ${urlPathname}`);

  // overrides renderer/_default.page.server.ts
  const protectedRoutes = [
    // ''
    '/api-data/debug',
  ];

  let redirectTo = undefined;
  if (protectedRoutes.includes(urlPathname) && !user) {
    console.log(`[ui] [api-data] [onBeforeRender] !user && protectedRoutes.includes(urlPathname)`);
    redirectTo = user ? undefined : '/auth/login';
    throw render('/auth/login');
  }
  console.log(
    `[ui] [api-data] [onBeforeRender] redirectTo ${JSON.stringify({ redirectTo }, null, 2)}`
  );

  const pathMapping = {
    // '/api-data/debug': '/api/health/debug',
    '/api-data/health': { route: 'api/health/check', options: {} },
    '/api-data/healthE': { route: 'api/health/check2', options: {} },
    '/api-data/json-file': { route: 'api/json-data', options: {} },
  } as Record<string, any>;
  let { dataLoading, error, data } = {
    dataLoading: ref(false),
    error: ref(),
    data: ref(undefined),
  };
  if (pathMapping[urlPathname]) {
    const opts = {
      ...pathMapping[urlPathname].options,
      csrfToken,
      sessionToken,
      callbackUrl,
      headers: {
        ...pathMapping[urlPathname].options.headers,
        'X-CSRF-Token': csrfToken,
        'authjs.csrf-token': csrfToken,
        'authjs.session-token': sessionToken,
      },
    } as RequestConfig;

    // use session token

    console.log(`[ui] [api-data] [onBeforeRender] opts`);
    console.log(opts);
    ({ dataLoading, error, data } = await useFetch(pathMapping[urlPathname].route, opts));

    if (error.value) {
      console.error(`[ui] [api-data] [onBeforeRender] error:`);
      console.error(error.value);
      if (error.value.status === 401) {
        throw render(401, {
          noSession: true,
          notAdmin: !user?.roles.includes(UserRole.Admin),
          message: 'Only logged in users are allowed to access this page.',
        });
      }
      if (error.value.status === 403) {
        throw render(403, {
          noSession: false,
          notAdmin: !user?.roles.includes(UserRole.Admin),
          message: 'Only admins are allowed to access this page.',
        });
      }
    }
  }

  return {
    pageContext: {
      redirectTo,
      pageProps: {
        isAdmin: user?.roles.includes(UserRole.Admin) || false,
        apiData: data.value,
        apiDataLoading: dataLoading.value,
        apiDataError: error.value,
      },
    },
  };
}
