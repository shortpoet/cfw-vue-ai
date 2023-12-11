import { renderToString as renderToString_ } from '@vue/server-renderer';
import { createHead, renderHeadToString } from '@vueuse/head';
import { escapeInject, dangerouslySkipEscape } from 'vike/server';
import { PageContext, PageContextServer } from '@cfw-vue-ai/types';
import { createApp } from './app';
import type { App } from 'vue';

export { render };
export { passToClient };
export { onBeforeRender };

async function onBeforeRender(pageContext: PageContext) {
  console.log(`[ui] [server] [onBeforeRender] START\n`);
  const { session, cf, callbackUrl, csrfToken, isAdmin, urlPathname } = pageContext;
  console.log(`[ui] [server] [onBeforeRender] urlPathname: ${urlPathname}`);
  console.log(`[ui] [server] [onBeforeRender] session: ->`);
  console.log(session);
  console.log(`[ui] [server] [onBeforeRender] cf: ->`);
  console.log(cf);
  console.log(`[ui] [server] [onBeforeRender] callbackUrl: ${callbackUrl}`);
  console.log(`[ui] [server] [onBeforeRender] csrfToken: ${csrfToken}`);
  const user = pageContext.session?.user;
  const isLoggedIn = user !== null && user !== undefined;
  // const isAdmin = user?.role === "admin";
  let redirectTo: string | undefined;

  const protectedRoutes = ['/api-data/health', '/api-data/healthE'];

  const path = pageContext.urlPathname;

  console.log(`[ui] [server] [onBeforeRender] is logged in ${isLoggedIn} isAdmin ${isAdmin}`);

  // client-side routing is enabled
  switch (true as boolean) {
    case protectedRoutes.includes(path) && !user:
      redirectTo = '/auth/login';
      break;
    // case !user.status.EMAIL_VERIFIED:
    //   redirectTo = '/register/verify-email';
    //   break;
    default:
      redirectTo = undefined;
      break;
  }
  console.log(`[ui] [server] [onBeforeRender] redirectTo: ${redirectTo}`);

  return {
    pageContext: {
      redirectTo,
      session,
      isAdmin,
      cf,
      callbackUrl,
      csrfToken,
      pageProps: {
        isAdmin,
        session,
        cf,
        loading: false,
        csrfToken,
        callbackUrl,
      },
    },
  };
}

// See https://vite-plugin-ssr.com/data-fetching
const passToClient = [
  'pageProps',
  'documentProps',
  'routeParams',
  'session',
  'csrfToken',
  'callbackUrl',
  'redirectTo',
  'isAdmin',
  'cf',
  'sessionToken',
  'pkceCodeVerifier',
];

async function render(pageContext: PageContextServer) {
  const { session, cf, callbackUrl, csrfToken, isAdmin, Page, pageProps, redirectTo } = pageContext;
  // This render() hook only supports SSR, see https://vike.dev/render-modes for how to modify render() to support SPA
  if (!Page)
    throw new Error(
      '[ui] [server] [render] My render() hook expects pageContext.Page to be defined'
    );
  console.log(`[ui] [server] [render] START\n`);
  const app = createApp(Page, pageProps, pageContext);

  // const app = createApp(pageContext);
  const appHtml = await renderToString(app);

  // See https://vite-plugin-ssr.com/head
  const { documentProps } = pageContext.exports;
  const title = (documentProps && documentProps.title) || 'AI Maps App';
  const desc =
    (documentProps && documentProps.description) ||
    'AI powered Mapping App using Vite + vite-plugin-ssr';

  const { headTags, htmlAttrs, bodyAttrs, bodyTags } = await renderHeadToString(createHead());

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en" ${htmlAttrs}>
    <head>
      ${headTags}
    </head>
    <body${bodyAttrs}>
      <div id="app">${dangerouslySkipEscape(appHtml)}</div>
      ${bodyTags}
    </body>
    </html>`;

  if (redirectTo) {
    return {
      pageContext: { redirectTo },
    };
  }

  return {
    documentHtml,
    pageContext: {
      // We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
      enableEagerStreaming: true,
      session,
      redirectTo,
      cf,
    },
  };
}
async function renderToString(app: App) {
  let err: unknown;
  // Workaround: renderToString_() swallows errors in production, see https://github.com/vuejs/core/issues/7876
  app.config.errorHandler = (err_) => {
    err = err_;
  };
  const appHtml = await renderToString_(app);
  if (err) throw err;
  return appHtml;
}
