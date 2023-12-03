<template>
  <main class="page-shell-main">
    <div class="layout">
      <MainNav />
      <!-- <RenderContent v-if="canShowContent" model="page" :content="content" :api-key="builderApiKey" /> -->
      <div class="main-container">
        <div class="content">
          <slot />
        </div>
        <div class="footer">
          <Footer />
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
// import { ref } from 'vue';
import { useHead } from '@vueuse/head';
import MainNav from '@/ui/src/components/base/MainNav.vue';
import Footer from '@/ui/src/components/base/Footer.vue';
import { meta, title, link } from '@/ui/src/renderer/meta';
useHead({
  title,
  meta,
  link,
})
// import { fetchOneEntry, RenderContent, isPreviewing } from '@builder.io/sdk-vue/vue3';
// import '@builder.io/sdk-vue/vue3/css'
// import { onMounted } from 'vue';
// const canShowContent = ref(false);
// const content = ref();
// // const builderApiKey = ref("")
// // const builderApiKey = import.meta.env.VITE_BUILDER_API_KEY;
// const builderApiKey = ref(process.env.VITE_APP_BUILDER_API_KEY || "");
// onMounted(() => {
//   fetchOneEntry({
//     model: 'page',
//     apiKey: builderApiKey.value,
//     userAttributes: {
//       urlPath: window.location.pathname,
//     },
//   }).then(res => {
//     // if (!content.value) {}
//     content.value = res;
//     canShowContent.value = content.value || isPreviewing();
//   });
// })

</script>

<style></style>

<style scoped>
@import url('@/ui/src/styles/page-shell.css');
</style>
