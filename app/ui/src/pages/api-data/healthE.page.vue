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
  
<script lang="ts">
import { usePageContext } from '../../composables';

export default {
  components: {
    ApiViewerFetch
  },
  setup() {
    const pageContext = usePageContext();
    const pageProps = pageContext?.pageProps || { apiData: undefined, apiDataLoading: true, apiDataError: undefined };
    const { apiData, apiDataLoading, apiDataError } = pageProps;

    return {
      apiData,
      apiDataLoading,
      apiDataError
    }
  }
}
</script>
