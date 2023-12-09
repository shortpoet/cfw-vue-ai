<template>
  <div v-if="authLoading">
    authLoading...
  </div>
  <div v-else-if="authError">
    <div>
      <slot name="logout" :onLogout="onLogout" :isLoggedIn="isLoggedIn" />
    </div>
    <div>
      {{ authError }}
    </div>
  </div>
  <div v-else>
    <div>
      <slot name="login" :onLogin="onLogin" :isLoggedIn="isLoggedIn" />
    </div>
    <div>
      <slot name="login-popup" :onLoginPopup="onLoginPopup" :isLoggedIn="isLoggedIn" />
    </div>
    <div>
      <slot name="logout" :onLogout="onLogout" :isLoggedIn="isLoggedIn" />
    </div>
    <ul>
      <li>User Info</li>
      <div v-if="!session?.expires" i-carbon-bot />
      <div v-else>
        {{ session }}
      </div>
    </ul>
  </div>
</template>

<script setup lang="ts">

import { UserUnion } from '@/types/src';

defineProps<{
  usePopup?: boolean;
}>();
let onLogin = ref((event: any) => { console.log(`[ui] [login.component] womp login ${event}`); });
let onLogout = ref((event: any) => { console.log(`[ui] [login.component] logout ${event}`); });
let onLoginPopup = ref((event: any) => { console.log(`[ui] [login.component] login popup ${event}`); });
const slots = useSlots()
const loginSlot = slots.login;
let user = ref<UserUnion>();
let authLoading = ref(false);
let authError = ref(null);
let isLoggedIn = ref(false);


const pageContext = usePageContext();
const session = pageContext.session;

// const { useCookies } = await import('@vueuse/integrations/useCookies');
// const cookies = useCookies([COOKIES_USER_TOKEN]);

if (import.meta.env.VITE_LOG_LEVEL === 'debug') {
  console.log("[ui] [login.component] setup done");
  console.log(`[ui] [login.component] login slot`);
  console.log(loginSlot);
}

if (typeof window !== "undefined") {
  console.log("[ui] [login.component] typeof window !== 'undefined' -> can now load things that would break SSR");
  const auth = useNextAuth();
  const { login, logout, authLoading } = auth;
  ({ authError, isLoggedIn } = auth);
  user = auth.user || user;
  const authStore = useAuthStore();
  console.log(`[ui] [login.component] authLoading.value ${authLoading.value}`);
  onLogin.value = async (event: any) => {
    console.log("[ui] [login.component] onLogin");
    // cookie options must be in both set and remove
    // cookies.set(COOKIES_USER_TOKEN, true, cookieOptions)
    await login();
  };
  onLoginPopup.value = async (event: any) => {
    console.log("[ui] [login.component] onLoginPopup");
    // cookies.set(COOKIES_USER_TOKEN, true, cookieOptions)
    // await loginWithPopup();
  };
  onLogout.value = async (event: any) => {
    console.log("[ui] [login.component] onLogout");
    // cookies.remove(COOKIES_USER_TOKEN, cookieOptions);
    // cookies.remove(COOKIES_SESSION_TOKEN, cookieOptions)
    await logout();
    authStore.setLoggedIn(false);
  };
}

</script>
