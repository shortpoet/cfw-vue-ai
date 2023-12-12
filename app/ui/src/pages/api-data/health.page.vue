<template>
  <div class="page-container">
    <ApiViewerFetch :title="'Health'" :data="apiData" :loading="apiDataLoading" :error="apiDataError" />
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
const { pageProps } = usePageContext();
const { apiData, apiDataLoading, apiDataError } = pageProps ?? {};
</script>
