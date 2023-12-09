<script setup lang="ts">
import { computed, ref } from 'vue';
import { toggleDark, toggleLocales, usePageContext } from '../../composables';
// import { t } from '@/composables/i18n';
import Link from './Link.vue';

const pageContext = usePageContext()
// console.log('pageContext')
// console.log(pageContext)
// console.log(pageContext.urlPathname)
// WARNING THIS LEAKS TOKEN  
// console.log(pageContext.urlOriginal)
// WARNING THIS LEAKS TOKEN

// this worked once i made it computed. it reloads the SPA though when you click it
// also fails in data fetching because the route guard is tied to pagecontext
const urlPathname = computed(() => {
  // console.log(`[ui] [Footer] [urlPathname] [pageContext.urlPathname] :: ${pageContext.urlPathname}`)
  return pageContext.urlPathname === '/' ? 'markdown-about' : `${pageContext.urlPathname}/about`
})

const homeTitle = ref('Home');
const toggleDarkTitle = ref('Toggle Dark');
const toggleLangsTitle = ref('Toggle Langs');

// const props = defineProps({
//   user: {
//     type: Object,
//     required: false,
//     default: null
//   }
// });
// const user = ref(props.user);
</script>

<template>
  <nav text-xl mt-6 class="footer-nav">
    <Link :title="homeTitle" class="icon-btn mx-2" href="/">
    <div i-carbon-campsite />
    </Link>

    <Link class="icon-btn mx-2" :title="toggleDarkTitle" @click="toggleDark()">
    <div i="carbon-sun dark:carbon-moon" />
    </Link>

    <Link :title="toggleLangsTitle" class="icon-btn mx-2" @click="toggleLocales()">
    <div i-carbon-language />
    </Link>

    <Link class="icon-btn mx-2" :href="`${urlPathname}`" :title="'about'">
    <div i-carbon-dicom-overlay />
    </Link>

    <Link class="icon-btn mx-2" rel="noreferrer" href="https://github.com/shortpoet" target="_blank" title="GitHub">
    <div i-carbon-logo-github />
    </Link>

    <DropMenu :icon-class="'i-carbon-user-filled'" />

  </nav>
</template>

<style scoped></style>