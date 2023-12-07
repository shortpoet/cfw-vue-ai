<template>
  <main class="page-shell-main">
    <div class="layout">
      <MainNav />
      <div class="main-container">
        <Suspense>
          <template v-if="authLoading">
            <div flex flex-col class="items-center justify-center p-5">
              <h1 class="block whitespace-pre-line bg-yellow-200 p-5 rounded-xl text-center text-4xl font-bold">
                {{ `Next Auth\nSession\nLoading ...` }}
              </h1>
              <slot name="fallback" />
            </div>
          </template>
          <template v-else>
            <div class="suspense-wrapper">
              <component :is="pageComponent">
                <slot name="default" />
              </component>
            </div>
          </template>
        </Suspense>
        <div class="footer">
          <Footer />
        </div>
      </div>
    </div>
  </main>

  <div class="layout">
  </div>
</template>
<style scoped>
@import url('@/ui/src/styles/page-shell.css');
</style>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import UserLayout from '@/ui/src/layouts/UserLayout.vue';
import AdminLayout from '@/ui/src/layouts/AdminLayout.vue';
import { usePageContext } from '@/ui/src/composables/pageContext';
import MainNav from '@/ui/src/components/base/MainNav.vue';
import { useNextAuth } from '@/ui/src/composables/auth';
import { useAuthStore } from '../stores';
import Footer from '@/ui/src/components/base/Footer.vue';
import { UserRole } from '@/types';
import { useHead } from '@vueuse/head';
import { meta, title, link } from '@/ui/src/renderer/meta';

useHead({
  title,
  meta,
  link,
})

let authLoading = ref(true);
const pageContext = usePageContext();
const isAdmin = computed(() => pageContext.session?.user.roles?.includes(UserRole.Admin));

console.log('[ui] [NextAuthLayout] [pageContext] isAdmin -> ', isAdmin.value);

let Layout = isAdmin.value ? AdminLayout : UserLayout;
const pageComponent = computed(() => {
  console.log('[ui] [NextAuthLayout] [computed.pageComponent] -> isAdmin ', isAdmin.value);
  return Layout;
});


onMounted(async () => {
  const authStore = useAuthStore();
  const session = ref(pageContext.session);
  if (session.value) {
    console.log('[ui] [NextAuthLayout] [onMounted] session -> ', session.value);
    console.log('[ui] [NextAuthLayout] [onMounted] authStore.session -> ', authStore.session);
    authStore.setSession(session.value);
  }

  const auth = useNextAuth();
  const { onLoad } = auth;
  await onLoad();
  authLoading.value = auth.authLoading.value;
})

</script>
