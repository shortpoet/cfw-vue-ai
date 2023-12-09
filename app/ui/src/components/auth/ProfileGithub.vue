<template>
  <ul>
    <li>
      <Link href="/orig/about" :title="'about'">
      <div v-if="!loggedIn && !githubUser" i-carbon-dicom-overlay />
      <img v-else :src="githubUser?.image || 'TODO ALT'" class="w-8 h-8 rounded-full" />
      </Link>
    </li>
    <li>{{ githubUser?.name }}</li>
    <li>{{ githubUser?.email }}</li>
    <li>{{ githubUser?.nickname }}</li>
    <li>Other info</li>
    <Login>
      <template #login="loginProps">
        <li>
          <button class="c-yellow btn m-3 text-sm py-2 px-4 rounded-full" id="login-button" :disabled="loggedIn"
            @click="loginProps.onLogin">Log in</button>
        </li>
      </template>
      <template #logout="logoutProps">
        <li>
          <button
            class="c-yellow btn m-3 text-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            id="logout-button" :disabled="!loggedIn" @click="logoutProps.onLogout">Log out</button>
        </li>
      </template>
    </Login>

  </ul>
</template>

<script setup lang="ts">
import { GithubUser } from '@/types';
defineProps<{
  iconClass: string;
  // user: UserUnion;
}>();
let githubUser = ref<GithubUser>();
let loggedIn = ref(false);
if (typeof window !== "undefined") {
  console.log("[ui] ProfileGithub.typeof window !== 'undefined' -> can now load things that would break SSR");
  console.log(`[ui] ProfileGithub setup`)
  const authStore = useAuthStore();
  const pageContext = usePageContext();
  const session = ref(pageContext.session);

  let { currentUser, isLoggedIn, isGithubUser, gitHubUser } = authStore;
  const user = ref(currentUser);
  loggedIn = ref(isLoggedIn && !!user.value);
  const isGhUser = ref((session.value && session.value.user && isGithubUser(session.value?.user)))

  console.log(`[ui] ProfileGithub setup loggedIn: ${loggedIn.value}`)
  console.log(`[ui] ProfileGithub setup user: ${user.value}`)
  console.log(`[ui] ProfileGithub setup githubUser: ${githubUser.value}`)
  console.log(`[ui] ProfileGithub setup isGithubUser: ${isGhUser.value}`)
  console.log(`[ui] ProfileGithub setup session: ${session}`)
  console.log(session)
  if (loggedIn.value && isGhUser.value && session.value?.user) {
    console.log('user is a github user');
    authStore.initUser(session.value?.user);
    githubUser.value = gitHubUser;
  }
  watch(() => authStore.currentUser, () => {
    console.log('user changed');
    if (loggedIn.value && isGhUser.value && session.value?.user) {
      console.log('user is a github user');
      // user.value = authStore.currentUser;
      githubUser.value = gitHubUser;
      loggedIn.value = authStore.isLoggedIn;
    }

  });
}

</script>

<style scoped>
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  z-index: 10;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  width: 200px;
  padding: 8px;
}

.dropdown-menu-enter-active,
.dropdown-menu-leave-active {
  transition: opacity 0.2s;
}

.dropdown-menu-enter-from,
.dropdown-menu-leave-to {
  opacity: 0;
}

/* my drop up */
.dropup {
  position: relative;
  display: inline-block;
}

.dropup-menu {
  position: absolute;
  bottom: 100%;
  background-color: #f1f1f1;
  min-width: 280px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); */
  z-index: 10;
  background-color: #fff;
  /* border: 1px solid #ccc; */
  border-radius: 4px;
  /* width: 200px; */
  /* padding: 8px; */
}

.dropup-menu-enter-active,
.dropup-menu-leave-active {
  transition: opacity 0.2s;
}

.dropup-menu-enter-from,
.dropup-menu-leave-to {
  opacity: 0;
}


/* drop up */
.drop-u-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  width: 200px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-bottom: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transform: translateY(100%);
}

.drop-u-menu::before {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  border: 10px solid transparent;
  border-top-color: #fff;
  transform: translate(50%, 50%) rotate(45deg);
}

.drop-u-menu.is-open {
  transform: translateY(-100%);
}

.drop-u-menu.is-open::before {
  bottom: -20px;
  border-top-color: transparent;
  border-bottom-color: #fff;
}
</style>
