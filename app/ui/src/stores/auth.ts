import { acceptHMRUpdate, defineStore } from 'pinia';
import {
  BaseUser,
  GithubUser,
  Session,
  SessionUnion,
  User,
  UserUnion,
  isGithubUser,
  UserType,
} from '@cfw-vue-ai/types';
import { useStorage } from '@vueuse/core';
import { usePageContext } from '../composables';
import { uuidv4 } from '@cfw-vue-ai/utils';

const initBaseUser = (user: SessionUnion['user']): BaseUser => {
  const id = uuidv4();
  const email = user.email;
  const emailVerified = user.emailVerified;
  const name = user.name;
  const roles = user.roles;
  const created_at = user.created_at;
  const updated_at = user.updated_at;
  let userType: UserType;
  let image: any;
  let username: string | undefined;
  let password: string | undefined;
  let sub: string | undefined;

  switch (true) {
    case isGithubUser(user):
      userType = UserType.GitHub;
      image = user.image;
      break;
    default:
      throw new Error('invalid user type');
  }
  const baseUser: BaseUser = {
    id,
    email,
    emailVerified,
    name,
    created_at,
    updated_at,
    roles,
    userType,
    image,
    username,
    password,
    sub,
  };
  return baseUser;
};

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: () => ({
    authState: '',
    nonce: '',
    idToken: '',
    accessToken: '',
    isLoggedIn: false,
    currentUser: {} as UserUnion,
    gitHubUser: {} as GithubUser,
    loginRedirectPath: '',
    session: {} as SessionUnion,
  }),
  actions: {
    initRandomAuthState() {
      const state = Math.random().toString(36).substring(2);
      this.authState = state;
      return state;
    },
    initRandomNonce() {
      const nonce =
        Math.random().toString(32).substring(2) + Math.random().toString(32).substring(2);
      this.nonce = nonce;
      return nonce;
    },
    setIdToken(token: string) {
      this.idToken = token;
    },
    setAccessToken(token: string) {
      this.accessToken = token;
    },
    setLoggedIn(loggedIn: boolean) {
      this.isLoggedIn = loggedIn;
    },
    setCurrentUser(user: UserUnion) {
      this.currentUser = user as UserUnion;
    },
    setGithubUser(user: GithubUser) {
      this.gitHubUser = user;
    },
    setNonce(nonce: string) {
      this.nonce = nonce;
    },
    setAuthState(state: string) {
      this.authState = state;
    },
    setLoginRedirectPath(path: string) {
      this.loginRedirectPath = path;
    },
    isGithubUser: isGithubUser,
    setSession(session: SessionUnion) {
      this.session = session;
      this.isLoggedIn = true;
    },
    initUser(user: SessionUnion['user']) {
      const githubUser = isGithubUser(user) ? user : undefined;
      if (githubUser) {
        const initUser = initBaseUser(githubUser);
        this.setCurrentUser(initUser);
        this.setGithubUser(githubUser);
      }
    },
  },
  // persist: [
  //   { key: "authState", storage: sessionStorage },
  //   { key: "nonce", storage: sessionStorage },
  //   { key: "idToken", storage: sessionStorage },
  //   { key: "accessToken", storage: sessionStorage },
  //   { key: "isLoggedIn", storage: sessionStorage },
  //   { key: "currentUser", storage: sessionStorage },
  // ],
});

// export const useAuthStore = defineStore("auth", () => {
//   console.log("creating auth store");
//   /**
//    * Current state for preventing attacks
//    * https://auth0.com/docs/secure/attack-protection/state-parameters
//    */
//   const savedState = ref("");

//   /**
//    * Changes the current name of the user and saves the one that was used
//    * before.
//    *
//    * @param name - new name to set
//    */
//   function setSavedState(state: string) {
//     savedState.value = state;
//   }

//   function initRandomState() {
//     const state = Math.random().toString(36).substring(2);
//     setSavedState(state);
//   }

//   console.log("auth store created");
//   return {
//     initRandomState,
//     savedState,
//   };
// });

// breaks things
// https://github.com/vuejs/pinia/issues/690
// https://www.reddit.com/r/vuejs/comments/snh25a/cryptic_error_with_pinia_vue_3_typescript/
// https://stackoverflow.com/questions/70681667/cant-use-vue-router-and-pinia-inside-a-single-store
if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
