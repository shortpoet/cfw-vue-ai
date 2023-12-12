import { PageContext } from '@cfw-vue-ai/types';
import { createApp } from './app';
import { usePageTitle } from '../composables';
import { navigate } from 'vike/client/router';
import { render as renderAbort, redirect } from 'vike/abort';

export const clientRouting = true;
export const prefetchStaticAssets = 'viewport';
export { render };
export { onHydrationEnd };
export { onPageTransitionStart };
export { onPageTransitionEnd };

// let app: Awaited<Promise<PromiseLike<ReturnType<typeof createApp>>>>;
let app: ReturnType<typeof createApp>;

async function render(pageContext: PageContext) {
  // console.log('client.render');
  const { Page, pageProps } = pageContext;
  if (!Page) throw new Error('Client-side render() hook expects pageContext.Page to be defined');

  const { session, redirectTo, cf, urlPathname, sessionToken } = pageContext;

  console.log(`[ui] [client] [render] START\n`);
  console.log(`[ui] [client] [render] urlPathname: ${urlPathname}`);
  console.log(`[ui] [client] [render] session: ->`);
  console.log(session);
  console.log(`[ui] [client] [render] redirectTo: ${redirectTo}`);
  console.log(`[ui] [client] [render] sessionToken: ${sessionToken}`);
  console.log(`[ui] [client] [render] cf: ->`);
  console.log(cf);

  if (redirectTo) {
    // console.log(`redirectTo: ${redirectTo}`);
    try {
      // throw renderAbort(`/${redirectTo.replace(/^\//, '')}`);
      // navigate(redirectTo);
    } catch (error) {
      console.error(error);
    }
    // return;
  }

  // const { Page, Layout } = pageContext.exports;
  // console.log(Page, Layout);
  if (!app) {
    app = await createApp(Page, pageProps, pageContext);
    app.mount('#app');
  } else {
    app.changePage(pageContext);
  }
  const { title } = usePageTitle(pageContext);
  document.title = title;
}

/* To enable Client-side Routing:
export const clientRouting = true
// !! WARNING !! Before doing so, read https://vike.dev/clientRouting */

function onHydrationEnd() {
  console.log('[ui] [client] [onHydrationEnd] Hydration finished; page is now interactive.');
}
function onPageTransitionStart() {
  console.log('[ui] [client] [onPageTransitionStart] Page transition start');
  document.querySelector('.content')!.classList.add('page-transition');
}
function onPageTransitionEnd() {
  console.log('[ui] [client] [onPageTransitionEnd] Page transition end');
  document.querySelector('.content')!.classList.remove('page-transition');
}
