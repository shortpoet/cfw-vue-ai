<template>
  <div class="page-container">
    <ApiViewer :title="'Hello'" :urlPath="'api/hello'" />
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
}
</style>
  
<script lang="ts">
import ApiViewer from '@/ui/src/components/base/ApiViewer.vue';

export default {
  components: {
    ApiViewer
  },
}
</script>
