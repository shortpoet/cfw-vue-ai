<template>
  <div class="page-container">
    <ApiViewerFetch :title="'Health-E'" :data="apiData" :loading="apiDataLoading" :error="apiDataError" />
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
}
</style>
  
<script setup lang="ts">
import { usePageContext } from '../../composables';
const { pageProps } = usePageContext() ||
  { pageProps: { apiData: undefined, apiDataLoading: true, apiDataError: undefined } };
const { apiData, apiDataLoading, apiDataError } = pageProps;
</script>
