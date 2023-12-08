import type { ComponentPublicInstance } from 'vue';
import { ResponseCfProperties } from './cf';
import { Session } from './auth';

export type {
  PageContextServer,
  // When using Client Routing https://vike.dev/clientRouting
  PageContextClient,
  PageContext,
  /*/
  // When using Server Routing
  PageContextClientWithServerRouting as PageContextClient,
  PageContextWithServerRouting as PageContext
  //*/
} from 'vike/types';
export type { PageProps };
export type { Component };
export type { Page };

type Component = ComponentPublicInstance; // https://stackoverflow.com/questions/63985658/how-to-type-vue-instance-out-of-definecomponent-in-vue-3/63986086#63986086
type Page = Component;
// let instance: ComponentPublicInstance<{ prop: string }, { value: string }>;
// type Page = ComponentPublicInstance; // https://stackoverflow.com/questions/63985658/how-to-type-vue-instance-out-of-definecomponent-in-vue-3/63986086#63986086
type PageProps = {
  isAdmin: boolean;
  loading?: boolean;
  session?: Session | null;
  csrfToken?: string;
  callbackUrl?: string;
  cf?: ResponseCfProperties;
  apiData?: any;
  apiDataLoading?: boolean;
  apiDataError?: any;
};
