import {
  BaseUser,
  NextAuthInstance,
  Session,
  SetSessionResult,
  User,
  isCredentialsUser,
  isEmailUser,
  isGithubUser,
  UserUnion,
  SessionUnion,
} from "types/index";
import { InjectionKey, ref, provide, inject } from "vue";
// import { CookieSetOptions } from "universal-cookie";
import { useFetch } from "./fetch";
import { useAuthStore } from "../stores";
import { storeToRefs } from "pinia";
// import { escapeNestedKeys } from "ai-maps-util/index";
// import { navigate } from "vite-plugin-ssr/client/router";

export {
  COOKIES_SESSION_TOKEN,
  COOKIES_USER_TOKEN,
  SESSION_TOKEN_EXPIRY,
  cookieOptions,
  useNextAuth,
};

const AuthSymbol: InjectionKey<NextAuthInstance> = Symbol();

// const authClient = ref<Auth0Client | null>(null);
// let redirectCallback: (appState: any) => void;
// const redirectCallback = ref(DEFAULT_REDIRECT_CALLBACK);
const user = ref<UserUnion>();
const session = ref<SessionUnion | undefined>();
const token = ref<string>();
const authLoading = ref(true);
const error = ref<any>();
const isLoggedIn = ref(false);
const audience = `https://ssr.shortpoet.com`;
const scope = "openid profile email offline_access";
const response_type = "code";

const COOKIES_USER_TOKEN = `${process.env.VITE_APP_NAME}-next-user-token`;
const COOKIES_SESSION_TOKEN = `${process.env.VITE_APP_NAME}-next-session-token`;
const SESSION_TOKEN_EXPIRY = 60 * 60; // 1 hour

const cookieOptions: any = {
  // const cookieOptions: CookieSetOptions = {
  path: "/",
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
  maxAge: 60 * 60 * 24,
  domain: "localhost",
  sameSite: "strict",
  // below only works in https
  // secure: true,
  // httpOnly: true,
};

export const provideAuth = () => {
  const auth = {
    user,
    authLoading,
    isLoggedIn,
    authError: error,
    session,

    login,
    onLoad,
    logout,
    setSession,
    isGithubUser,
    isEmailUser,
    isCredentialsUser,
  };

  provide(AuthSymbol, auth);
};

export const isClient = typeof window !== "undefined";
const defaultWindow: (Window & typeof globalThis) | undefined =
  /* #__PURE__ */ isClient ? window : undefined;

const useNextAuth = () => {
  const auth = inject(AuthSymbol);
  if (!auth) throw new Error("provideAuth() not called in parent");

  const authStore = useAuthStore();
  const {
    authState,
    isLoggedIn,
    nonce,
    idToken,
    accessToken,
    currentUser,
    loginRedirectPath,
  } = storeToRefs(authStore);
  const {
    initRandomAuthState,
    initRandomNonce,
    setIdToken,
    setLoggedIn,
    setCurrentUser,
    setAccessToken,
    setNonce,
    setAuthState,
    setLoginRedirectPath,
    setSession: setSessionStore,
  } = authStore;
  setNonce(nonce.value !== "" ? nonce.value : initRandomNonce());
  setAuthState(
    authState.value !== "" ? authState.value : initRandomAuthState()
  );
  auth.authState = ref(authStore.authState);
  auth.nonce = ref(authStore.nonce);
  auth.isLoggedIn = isLoggedIn;
  auth.idToken = idToken;
  auth.accessToken = accessToken;
  auth.user = currentUser;
  auth.loginRedirectPath = loginRedirectPath;
  auth.setIdToken = setIdToken;
  auth.setLoggedIn = setLoggedIn;
  auth.setCurrentUser = setCurrentUser;
  auth.setAccessToken = setAccessToken;
  auth.setNonce = setNonce;
  auth.setAuthState = setAuthState;
  auth.setLoginRedirectPath = setLoginRedirectPath;
  auth.setSessionStore = setSessionStore;
  // console.log(`authStore: ${JSON.stringify(authStore, null, 2)}`);
  return auth as NextAuthInstance;
};

const setSession = async (): Promise<SetSessionResult> => {
  // TODO set session type
  const url = new URL(`${process.env.NEXTAUTH_URL}/session`);
  const { data, error, dataLoading } = await useFetch<any>(url.href);
  let res: SetSessionResult = { session: undefined, status: "Loading" };
  if (error.value) {
    // if (process.env.VITE_LOG_LEVEL === 'debug')
    console.error(`[ui] useAuth.setSession error: ${error.value}`);
    res = { session: undefined, status: "Error" };
  }
  if (dataLoading.value) {
    // if (process.env.VITE_LOG_LEVEL === 'debug')
    console.log(`[ui] useAuth.setSession dataLoading: ${dataLoading.value}`);
  }
  if (data.value) {
    console.log(
      `[ui] useAuth.setSession data: ${JSON.stringify(data.value, null, 2)}`
    );
    res = { session: data.value, status: "Success" };
  }
  return res;
};

const onLoad = async () => {
  // this conflicts with getSession on server side and causes a mini redirect loop/series of unnecessary fetches
  // const _session = await setSession();
  // if (_session.status === 'Success') {
  //   console.log(`_session: ${JSON.stringify(_session, null, 2)}`);
  //   session.value = _session.session;
  // }
  authLoading.value = false;
  return null;
  [];
};

const login = async (options?: any) => {
  let res;
  const url = new URL(`${process.env.NEXTAUTH_URL}/signin`);
  const { data, error, dataLoading } = await useFetch(url.href);
  window.location.replace(url.href);
  // navigate(url.pathname);
  if (error.value) {
    // if (process.env.VITE_LOG_LEVEL === 'debug')
    console.error(`error: ${error.value}`);
  }

  if (dataLoading.value) {
    // if (process.env.VITE_LOG_LEVEL === 'debug')
    console.log(`dataLoading: ${dataLoading.value}`);
    res = { result: "Loading", status: "Loading" };
  }
  if (data.value) {
    console.log(`data: ${JSON.stringify(data.value, null, 2)}`);
    res = { result: "Success", status: "Success" };
    // const { session, user } = data.value;

    // if (process.env.VITE_LOG_LEVEL === 'debug') {
    //   let logObj = escapeNestedKeys({ ...data.value }, [
    //     'token',
    //     'body',
    //     'Authorization',
    //     'accessToken',
    //     'sessionToken',
    //   ]);
    //   console.log(`data: ${JSON.stringify(logObj, null, 2)}`);
    // }
  }
};

const logout = async () => {
  let res;
  const url = new URL(`${process.env.NEXTAUTH_URL}/signout`);
  const { data, error, dataLoading } = await useFetch(url.href);
  window.location.replace(url.href);
  // navigate(url.pathname);
  if (error.value) {
    console.error(`error: ${error.value}`);
  }

  if (dataLoading.value) {
    console.log(`dataLoading: ${dataLoading.value}`);
    res = { result: "Loading", status: "Loading" };
  }
  if (data.value) {
    console.log(`data: ${JSON.stringify(data.value, null, 2)}`);
  }
};
