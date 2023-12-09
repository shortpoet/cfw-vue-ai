<template>
  <div class="page-container" flex-col items-center flex>
    <h1>Auth</h1>
    <Link :href="`/auth`" :title="'back'">
    <i class="i-carbon-page-first" inline-block /><span>back</span>
    </Link>

    <Link :href="`${urlBase}/api/auth/session`" :title="'back'">
    <i class="i-carbon-user-activity" inline-block /><span>Session</span>
    </Link>

    <Login>
      <template #login="loginProps">
        <button class="btn m-3 text-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          id="login-button" :disabled="loginProps.isLoggedIn" @click="loginProps.onLogin">Log in</button>
      </template>
      <template #login-popup="loginPopupProps">
        <button class="btn m-3 text-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          id="login-button" :disabled="loginPopupProps.isLoggedIn" @click="loginPopupProps.onLoginPopup">Log in
          Popup</button>
      </template>
      <template #logout="logoutProps">
        <button class="btn m-3 text-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          id="logout-button" :disabled="logoutProps.authError" @click="logoutProps.onLogout">Log
          out</button>
      </template>
    </Login>
  </div>
</template>

<script setup lang="ts">
const urlBase = `${import.meta.env.VITE_API_URL}`
</script>
