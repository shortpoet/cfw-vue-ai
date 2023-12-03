import '@unocss/reset/tailwind.css';
import 'uno.css';
import '@/ui/src/styles/main.css';
import {
  ComponentPublicInstance,
  createSSRApp,
  defineComponent,
  h,
  markRaw,
  reactive
} from 'vue';
import { createHead } from '@vueuse/head';
import { install as installPinia } from '@/ui/src/modules/pinia';
import { StoreState } from 'pinia';
import { UiState } from '../stores';
import { provideAuth } from '@/ui/src/composables';
import { setPageContext } from '@/ui/src/composables';
import PageShell from '@/ui/src/layouts/PageShell.vue';
import { Component, PageContext, PageProps, Page } from 'types/index';

export const isClient = typeof window !== 'undefined';
const defaultWindow: (Window & typeof globalThis) | undefined = /* #__PURE__ */ isClient
  ? window
  : undefined;

// const initialState = defaultWindow?.__INITIAL_STATE__;
const initialState: StoreState<UiState> = {
  alaCartePath: ''
};

export { createApp };

function createApp(
  Page: Page,
  pageProps: PageProps | undefined,
  pageContext: PageContext
) {
  // console.log("createApp");
  // const { Page, pageProps, session, csrfToken, callbackUrl, isAdmin } = pageContext;
  const { session, csrfToken, callbackUrl, isAdmin, cf } = pageContext;
  let rootComponent: any;
  // let rootComponent: Component;
  // let rootComponent: ComponentPublicInstance;
  // let rootComponent: ComponentPublicInstance<{ prop: string }, { value: string }>;

  const PageWithWrapper = defineComponent({
    data: () => ({
      Page: markRaw(Page),
      pageProps: markRaw(pageProps || {}),
      Layout: markRaw(pageContext.exports.Layout || PageShell),
      session,
      csrfToken,
      callbackUrl,
      isAdmin,
      cf
    }),
    created() {
      rootComponent = this;
      provideAuth();
    },
    mounted() {},
    render() {
      return h(
        this.Layout,
        {},
        {
          default: () => {
            return h(this.Page, this.pageProps);
          }
        }
      );
    }
  });

  // console.log("createSSRApp");

  const app = createSSRApp(PageWithWrapper);
  installPinia(app, isClient, initialState);

  // We use `app.changePage()` to do Client Routing, see `_default.page.client.js`
  objectAssign(app, {
    changePage: (pageContext: PageContext) => {
      Object.assign(pageContextReactive, pageContext);
      rootComponent.Page = markRaw(pageContext.Page);
      rootComponent.pageProps = markRaw(pageContext.pageProps || {});
      // without the below line the layout only changes on reload, and then persists weirdly to other navigated pages
      rootComponent.Layout = markRaw(pageContext.exports.Layout || PageShell);
      rootComponent.session = pageContext.session;
      rootComponent.csrfToken = pageContext.csrfToken;
      rootComponent.callbackUrl = pageContext.callbackUrl;
      rootComponent.isAdmin = pageContext.isAdmin;
      rootComponent.cf = pageContext.cf;
    }
  });

  // When doing Client Routing, we mutate pageContext (see usage of `app.changePage()` in `_default.page.client.js`).
  // We therefore use a reactive pageContext.
  const pageContextReactive = reactive(pageContext);
  // Make `pageContext` accessible from any Vue component
  setPageContext(app, pageContextReactive);

  app.use(createHead());

  return app;
}

// Same as `Object.assign()` but with type inference
function objectAssign<Obj extends object, ObjAddendum extends object>(
  obj: Obj,
  objAddendum: ObjAddendum
): asserts obj is Obj & ObjAddendum {
  Object.assign(obj, objAddendum);
}
