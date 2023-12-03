<template>
  <div class="page-container">
    <ApiViewer :title="'Debug'" :urlPath="'api/health/debug'" />
  </div>
</template>

<style scoped></style>
  
<script lang="ts">
import ApiViewer from '@/ui/src/components/base/ApiViewer.vue';

export default {
  components: {
    ApiViewer
  },
}
</script>
