import { createPinia, StoreState } from 'pinia';
import { App, inject, InjectionKey, provide } from 'vue';
import { createPersistedState } from 'pinia-plugin-persistedstate';

// Setup Pinia
// https://pinia.vuejs.org/

export const InitialStateSymbol: InjectionKey<StoreState<any>> = Symbol();

// export const providePinia = () => {
//   const pinia = {};
//   provide(InitialStateSymbol, pinia);
// };

// const usePinia = () => {
//   const pinia = inject(InitialStateSymbol);
//   if (!pinia) throw new Error("No pinia store provided.");
//   return pinia as StoreState<any>;
// };

export const install = (app: App, isClient: boolean, initialState: StoreState<any>) => {
  // console.log("installing pinia");
  const pinia = createPinia();
  pinia.use(
    createPersistedState({
      // ssr not avail on load so can't set for now
      // storage: sessionStorage,
      key: (id) => `__persisted__${id}`,
      afterRestore: (ctx) => {
        console.log(`[ui] [pinia.use.createPersistedState] afterRestore`);
        // console.log(ctx);
      }
    })
  );
  // console.log("pinia created");
  // console.log(pinia);
  app.use(pinia);
  // Refer to
  // https://github.com/antfu/vite-ssg/blob/main/README.md#state-serialization
  // for other serialization strategies.
  if (isClient) pinia.state.value = initialState.pinia || {};
  else initialState.pinia = pinia.state.value;
};
